// Placeholder for a future TFLite inference service.
// Actual on-device inference currently uses TorchScript via native module.

// Local inference service using a bundled model.
// NOTE: This stub ensures the app runs without the server while we wire up true TFLite/TFJS inference.
// It exposes the same diagnoseImage() shape used by the UI.

import { Platform } from 'react-native';
import * as ImageManipulator from 'expo-image-manipulator';
import { toByteArray as base64ToBytes } from 'base64-js';
// jpeg-js is optional; dynamic require so TypeScript doesn't fail if not installed yet in dev build
let JPEG: any;
try { JPEG = require('jpeg-js'); } catch { /* will throw if used without dependency */ }

let LABELS: string[] = ['Healthy'];
try {
	// Labels file for class names (adjust path if you place it elsewhere)
	LABELS = require('../../assets/models/banana/labels.json');
} catch {
	// Fallback labels if JSON is missing
	LABELS = ['Healthy', 'Disease A', 'Disease B'];
}

// Force Metro to bundle the TFLite file so it is available in the native bundle later
// (when you integrate a native TFLite runtime or use tfjs-tflite on web).
// eslint-disable-next-line @typescript-eslint/no-var-requires
// Prefer model.tflite if present (copied from banana_api/) otherwise fall back to model_fp16.tflite
let BUNDLED_TFLITE: any;
try {
	BUNDLED_TFLITE = require('../../assets/models/model.tflite');
} catch {
	BUNDLED_TFLITE = require('../../assets/models/model_fp16.tflite');
}

// ===== Native TFLite (react-native-fast-tflite) dynamic loader =====
type TfliteModel = {
	run: (inputs: ArrayBufferView[]) => Promise<ArrayBufferView[]>;
	runSync: (inputs: ArrayBufferView[]) => ArrayBufferView[];
};
let _tfliteModel: TfliteModel | null = null;
let _tfliteTried = false;

async function ensureNativeModelLoaded(): Promise<'native' | 'stub'> {
	if (_tfliteModel) return 'native';
	if (_tfliteTried) return 'stub';
	_tfliteTried = true;
	try {
		// Dynamically import so Expo Go (no native module) won’t crash at bundle time
		const mod = require('react-native-fast-tflite');
		const loadTensorflowModel = (mod as any).loadTensorflowModel as (asset: any) => Promise<TfliteModel>;
		_tfliteModel = await loadTensorflowModel(BUNDLED_TFLITE);
		return 'native';
	} catch (e) {
		if (__DEV__) {
			// eslint-disable-next-line no-console
			console.warn('[LeafLens] Native TFLite not available (Expo Go). Using stub until you build a Dev Client. Error:', String(e));
		}
		_tfliteModel = null;
		return 'stub';
	}
}

function softmax(logits: Float32Array): Float32Array {
	const max = Math.max(...logits);
	let sum = 0;
	const exps = new Float32Array(logits.length);
	for (let i = 0; i < logits.length; i++) {
		const v = Math.exp(logits[i] - max);
		exps[i] = v;
		sum += v;
	}
	for (let i = 0; i < exps.length; i++) exps[i] = exps[i] / (sum || 1);
	return exps;
}

export type LocalDiag = {
	top1: { label: string; probability: number };
	topK: { label: string; probability: number }[];
};

/**
 * diagnoseImage: placeholder local inference that returns a deterministic stub
 * so the app works fully offline while you finish wiring TFLite/TFJS.
 *
 * To use the real .tflite model:
 * - Option A (recommended for Expo Web or pure JS): convert your model to TFJS and load via tfjs-react-native.
 * - Option B (native TFLite): add a TFLite RN module via an Expo dev build and load the bundled asset (BUNDLED_TFLITE).
 */
export async function diagnoseImage(imageUri: string, _opts: Record<string, unknown> = {}): Promise<LocalDiag> {
	// Try to use native TFLite; otherwise fall back to stub in Expo Go
	const mode = await ensureNativeModelLoaded();
	if (mode === 'native' && _tfliteModel) {
		// 1) Resize to 224x224 and get base64 JPEG
		const resized = await ImageManipulator.manipulateAsync(
			imageUri,
			[{ resize: { width: 224, height: 224 } }],
			{ compress: 1, base64: true, format: ImageManipulator.SaveFormat.JPEG }
		);
		if (!resized.base64) throw new Error('Failed to read image data');
		const jpgBytes = base64ToBytes(resized.base64);
		if (!JPEG) throw new Error('jpeg-js not installed; add it to dependencies for native inference');
		const decoded = JPEG.decode(jpgBytes, { useTArray: true }); // RGBA
		if (decoded.width !== 224 || decoded.height !== 224) {
			throw new Error(`Unexpected decoded size ${decoded.width}x${decoded.height}`);
		}
		const rgba = decoded.data as Uint8Array; // length = 224*224*4
		// 2) Convert RGBA -> Float32 RGB normalized [0,1]
		const input = new Float32Array(224 * 224 * 3);
		let j = 0;
		for (let i = 0; i < rgba.length; i += 4) {
			const r = rgba[i] / 255;
			const g = rgba[i + 1] / 255;
			const b = rgba[i + 2] / 255;
			input[j++] = r;
			input[j++] = g;
			input[j++] = b;
		}
		// 3) Run inference (assumes input tensor [1,224,224,3] float32)
		const outputs = await _tfliteModel.run([input]);
		const out0 = outputs[0];
		// Normalize outputs to probabilities
		let probs: Float32Array;
		if (out0 instanceof Float32Array) {
			// If values don't sum to ~1, apply softmax
			const s = (out0 as Float32Array).reduce((a, b) => a + b, 0);
			probs = s > 0.99 && s < 1.01 ? (out0 as Float32Array) : softmax(out0 as Float32Array);
		} else if (out0 instanceof Float64Array) {
			const f = new Float32Array(out0.length);
			for (let i = 0; i < out0.length; i++) f[i] = out0[i];
			const s = f.reduce((a, b) => a + b, 0);
			probs = s > 0.99 && s < 1.01 ? f : softmax(f);
		} else if (out0 instanceof Uint8Array) {
			// Quantized: convert to [0,1]
			const f = new Float32Array(out0.length);
			for (let i = 0; i < out0.length; i++) f[i] = out0[i] / 255;
			probs = f;
		} else {
			throw new Error('Unsupported output tensor type');
		}
		// 4) Build topK
			const pairs: { label: string; probability: number }[] = [];
			for (let idx = 0; idx < probs.length; idx++) {
				pairs.push({ label: LABELS[idx] ?? `Class ${idx}`, probability: probs[idx] });
			}
			pairs.sort((a, b) => b.probability - a.probability);
			const topK = pairs.slice(0, Math.min(5, pairs.length));
			const top1 = topK[0] ?? { label: LABELS[0] ?? 'Unknown', probability: 0 };
		return { top1, topK };
	}

	// Stub fallback for Expo Go (no native module)
	const label = LABELS[0] ?? 'Healthy';
	const confidence = 0.85;
	if (__DEV__) {
		// eslint-disable-next-line no-console
		console.warn('[LeafLens] Using stubbed local inference (Expo Go). Build a Dev Client to run model.tflite.');
		// eslint-disable-next-line no-console
		console.log('[LeafLens] Bundled TFLite asset id (resolved):', BUNDLED_TFLITE, 'Platform:', Platform.OS, 'Image URI:', imageUri);
	}
	const top1 = { label, probability: confidence };
	const alt = LABELS.slice(1, 3).map((l, i) => ({ label: l, probability: Math.max(0, 0.5 - i * 0.2) }));
	const topK = [top1, ...alt];
	return { top1, topK };
}

export function getLabels() {
	return LABELS.slice();
}
