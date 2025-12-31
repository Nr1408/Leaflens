# Local On‑Device Inference (TFLite)

This app now runs fully offline using a bundled TensorFlow Lite model. No server calls are made.

## What’s bundled
- Model: `assets/models/model.tflite` (falls back to `assets/models/model_fp16.tflite` if missing)
- Labels: `assets/models/banana/labels.json`

## Current status
- The service at `src/services/tfliteService.ts` returns a safe stub result so you can exercise the full app flow without any backend.
- Expo Go works out of the box with this stub (scan QR, take/upload an image, and you’ll see a local result).

## Enabling REAL on‑device inference
You have two implementation options. Pick one:

### Option A — Native TFLite (recommended for performance)
Requires an Expo Dev Build (can’t run inside Expo Go).
1) Add a TFLite React Native module (example: `react-native-tflite` or `tflite-react-native`).
2) Use an Expo config plugin or EAS Build to link native code.
3) In `tfliteService.ts`, replace the stub with calls to the native API (e.g., `runModelOnImage({ path, imageMean, imageStd })`).
4) Use `Asset.fromModule(require('...model.tflite'))` to resolve a local file path for the native loader.

### Option B — TensorFlow.js in JS (works in Expo Go)
Requires a TFJS model (model.json + shards), not `.tflite` directly.
1) Convert your original Keras/TF model to TFJS.
2) Add `@tensorflow/tfjs` and `@tensorflow/tfjs-react-native`.
3) Load with `tf.loadGraphModel(bundleResourceIO(...))` and run inference.

## Testing
- Start the dev server: `npm start` (already wired as a VS Code task).
- Use Expo Go to scan the QR and run completely offline.

## Notes
- If you choose Option A, I’ll add the dependency, config, and the real inference code, then we’ll build a dev client via EAS.
- If you choose Option B, I’ll add TFJS and wire the preprocessing to match your training pipeline.
