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

## Backend API (banana_api) – Docker-only workflow

This repo includes a FastAPI service in `banana_api/` designed to run in Docker. You can run it locally with Docker Desktop or deploy via CI to a registry and a platform like Render.

### Install Docker Desktop (Windows)

Either download from: https://www.docker.com/products/docker-desktop/

Or install via PowerShell:

```powershell
winget install -e --id Docker.DockerDesktop
```

After installation, start Docker Desktop and ensure `docker --version` works in a new PowerShell window.

### Build and run locally

Option A — mount your local model (recommended):

```powershell
cd banana_api
docker build -t leaflens-api:latest .

# Mount your model; replace the path if needed
docker run --rm -p 8000:8000 `
   -v C:\LeafLens\banana_api\best_model.pth:/app/best_model.pth:ro `
   -e MODEL_PATH=/app/best_model.pth `
   leaflens-api:latest
```

Option B — download model at startup (no mount):

```powershell
cd banana_api
docker build -t leaflens-api:latest .

docker run --rm -p 8000:8000 `
   -e MODEL_URL="https://<your-direct-url>/best_model.pth" `
   -e MODEL_PATH="/app/best_model.pth" `
   leaflens-api:latest
```

Option C — docker compose (mounts model by default):

```powershell
cd banana_api
docker compose up -d
# later
docker compose down
```

### Test endpoints (local)

```powershell
# Health
curl.exe -s http://127.0.0.1:8000/

# Browser UI (upload & predict)
# Open http://127.0.0.1:8000/ui

# CLI upload
curl.exe -s -F "file=@C:\LeafLens\assets\img\landing-hero.jpg" http://127.0.0.1:8000/predict/
```

### CI: build & publish image to GHCR

On push to `main`, GitHub Actions builds and pushes the image to GitHub Container Registry using `.github/workflows/docker-image.yml`.

- Image: `ghcr.io/<owner>/leaflens-api:latest`
- Example for this repo: `ghcr.io/nr1408/leaflens-api:latest`

Pull the image:

```powershell
docker pull ghcr.io/nr1408/leaflens-api:latest
```

Note: The workflow uses the built-in `GITHUB_TOKEN` with `packages: write` permission.

### Deploy on Render (docker)

Render can build from the Dockerfile using the `render.yaml` in the repo root.

Steps:
- Connect your GitHub repo on Render
- Render will detect `render.yaml` and create a Web Service
- Set env vars:
   - `MODEL_URL` = your direct model URL (or mount via a persistent disk and set `MODEL_PATH`)
   - `MODEL_PATH` = `/app/best_model.pth`
- Exposed port: 8000

If you prefer building elsewhere (e.g., GHCR), point Render to `ghcr.io/nr1408/leaflens-api:latest`.

### Notes
- The `.dockerignore` excludes `.pth` and other large artifacts from the image; supply the model at runtime via bind mount or `MODEL_URL`.
- Static upload UI is available at `/ui` inside the container.
