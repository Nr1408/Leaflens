/*
  Offline Inference (TorchScript Lite)
  - Loads a local TorchScript Lite model from device storage and runs prediction
    fully on-device. Used when cloud inference is unavailable.
*/
import { File, Paths } from 'expo-file-system';
import { Platform } from 'react-native';
import { loadModel as nativeLoadModel, diagnoseImage as nativeDiagnose } from '../native/OnDeviceInference';

// Class labels must match the training head order
const CLASS_NAMES = [
  'Anthracnose',
  'Banana Fruit-Scarring Beetle',
  'Banana Skipper Damage',
  'Banana Split Peel',
  'Black and Yellow Sigatoka',
  'Chewing insect damage on banana leaf',
  'Healthy Banana',
  'Healthy Banana leaf',
  'Panama Wilt Disease',
];

// Model loading strategy: load from filesystem to avoid bundling gigantic assets.
// Expected location on Android: /sdcard/Download/banana_model_mobile.ptl
// You can also place it under app sandbox: FileSystem.documentDirectory

let modelLoaded = false;
let modelLoadStarted = false;
let modelLoadDurationMs: number | null = null;

// Load the model once from any of the known locations
async function ensureModelLoaded() {
  if (modelLoaded) return true;
  if (!modelLoadStarted) {
    modelLoadStarted = true;
    console.log('[offlineInference] Starting model load');
  }
  const t0 = Date.now();
  // Candidate paths (first that exists will be used)
  const candidates: string[] = [];
  if (Platform.OS === 'android') {
    candidates.push('file:///sdcard/Download/banana_model_mobile.ptl');
    candidates.push('file:///storage/emulated/0/Download/banana_model_mobile.ptl');
  }
  try { candidates.push(new File(Paths.document, 'banana_model_mobile.ptl').uri); } catch {}
  try { candidates.push(new File(Paths.cache, 'banana_model_mobile.ptl').uri); } catch {}

  let foundPath: string | null = null;
  for (const p of candidates) {
    try {
      const f = new File(p);
      if (f.exists) { foundPath = f.uri; break; }
    } catch {}
  }
  if (!foundPath) {
    throw new Error('Model file not found. Please copy banana_model_mobile.ptl to your device Download folder or app documents.');
  }
  await nativeLoadModel(foundPath);
  modelLoadDurationMs = Date.now() - t0;
  console.log(`[offlineInference] Model loaded in ${modelLoadDurationMs} ms`);
  modelLoaded = true;
  return true;
}

// Run on-device preprocessing + inference and return top1/topK
export async function diagnoseOffline(imageUri: string) {
  const startTotal = Date.now();
  await ensureModelLoaded();

  // Run native preprocess + inference (center-crop->224, normalize 0.5/0.5/0.5, softmax)
  const startInfer = Date.now();
  const result = await nativeDiagnose(imageUri);
  const inferMs = Date.now() - startInfer;
  const probArr = result.probabilities;
  const topK = probArr
    .map((p: number, i: number) => ({ label: CLASS_NAMES[i] ?? `Class ${i}`, probability: p }))
    .sort((a: any, b: any) => b.probability - a.probability);
  const top1 = topK[0];

  const totalMs = Date.now() - startTotal;
  console.log(`[offlineInference] Inference complete. Total=${totalMs}ms (infer=${inferMs}ms, modelLoad=${modelLoadDurationMs ?? 'cached'}) Top1=${top1.label} Prob=${(top1.probability*100).toFixed(2)}%`);

  // Return shape compatible with existing Result flow
  return { top1, topK, predictions: topK };
}
