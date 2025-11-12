// Local inference service using a bundled model.
// NOTE: This stub ensures the app runs without the server while we wire up true TFLite/TFJS inference.
// It exposes the same diagnoseImage() shape used by the UI.

import { Platform } from 'react-native';

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
	// TODO: Replace this stub with real inference (TFLite native or TFJS).
	// For now, return a simple result that uses labels[0] and a pseudo-confidence.
	const label = LABELS[0] ?? 'Healthy';
	const confidence = 0.85;

	// Helpful guidance in development
	if (__DEV__) {
		// eslint-disable-next-line no-console
		console.warn('[LeafLens] Using stubbed local inference. To enable real on-device ML, follow the guidance in tfliteService.ts comments.');
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
