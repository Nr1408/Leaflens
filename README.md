LeafLens (Expo)

What it is
- Mobile app built with Expo and React Native for diagnosing banana leaf diseases on-device.
- Includes simple local auth, gallery/camera image input, TensorFlow.js integration, and result guidance.

Run it on your phone
1) Install Expo Go from the App Store or Google Play.
2) In this folder, start the dev server:

```powershell
npm start
```

3) Scan the QR code with your phone’s camera (Android) or the Expo Go app (iOS).

Auth prototype
- Credentials are stored locally in SecureStore for demo purposes only.
- Use any email/password to register, then login.

Diagnose workflow
- Tap “Scan Leaf”, pick an image or take a photo of a banana leaf.
- The app initializes tfjs-react-native and runs inference.
- For now, a heuristic is used until you drop in your model. You’ll still see labels, confidence, symptoms, and treatment.

Integrate your trained model
If you already have a trained model, choose one of the supported formats:
- TensorFlow.js GraphModel (model.json + weights .bin files)
- TensorFlow.js LayersModel

Steps:
1) Convert your model to TFJS if needed.
   - Recommended: use the conversion toolkit under `tools/convert` (Docker, Colab, or local venv).
   - Quick start (Windows PowerShell, Docker):
     ```powershell
     docker build -t keras2tfjs tools/convert
     docker run --rm -v ${PWD}:/work keras2tfjs \
       python tools/convert/convert_keras_to_tfjs.py \
       --input models/model.keras \
       --output-dir assets/models/banana \
       --format graph \
       --quantize float16
     ```
2) Place the files in `assets/models/banana/`:
   - `assets/models/banana/model.json`
   - `assets/models/banana/group1-shard1of1.bin` (or multiple shards)
3) Import and load in `src/services/modelService.ts`:
   - Uncomment the bundleResourceIO example and call `tf.loadGraphModel(ioHandler)`.
   - Replace `simpleHeuristic` logic with your model prediction and label mapping.
4) Update LABELS and INPUT_SIZE to match your model output and input size.

Label mapping
- Edit `src/data/bananaInfo.ts` to change disease names, symptoms, and treatments.

Notes
- Expo Go supports tfjs-react-native on Android/iOS. Initializing the WebGL backend may fall back to CPU; that’s okay for small models.
- If you see performance issues, consider EAS Build with Hermes and production bundles.
