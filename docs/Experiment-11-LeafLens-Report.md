# Experiment 11: Model Deployment using Docker (LeafLens – Banana Leaf Disease Detection)

Team (Max 4 Students)
- Student 1: Nishit (Roll No: ____)
- Student 2: ______________________
- Student 3: ______________________
- Student 4: ______________________

Batch: ____   |   Class: TY-COMP   |   Subject: Machine Learning

---

## Aim
Deploy a banana leaf disease classification model as a Dockerized web service and host it on a cloud platform. The service must accept a leaf image and return predicted disease labels with confidence scores. Provide a simple demo client (curl/Postman or web/mobile) to verify end-to-end.

## Problem Statement
Farmers often need fast identification of banana leaf diseases using smartphone photos. We need a reproducible, portable deployment that:
- Receives an image (JPEG/PNG)
- Runs ML inference reliably in the cloud (CPU-friendly)
- Responds with top prediction(s) and probability
- Scales independently from the mobile frontend

## Theory (Related to the Experiment)

### 1) ML Model Deployment
Deployment integrates a trained model into a production environment.
- Serving: expose HTTP endpoints (health, predict)
- Reproducibility: deterministic builds, pinned deps
- Reliability: handle invalid inputs, timeouts, errors
- Scalability: stateless container(s) behind load balancer
- Observability: logs, latency, error rates

### 2) Docker
Containerization packages the app, its dependencies, and runtime.
- Image: built from a Dockerfile
- Container: running instance of an image
- Registry: Docker Hub/GHCR to store and distribute images
- Benefits: consistent environments, isolation, fast rollbacks, versioned infra

### 3) Model (LeafLens)
- Task: Image classification (banana leaf disease types)
- Framework: PyTorch (backend); mobile app uses Expo React Native as client
- Inference: CPU-only PyTorch wheels to reduce image size and avoid CUDA
- Output: top-1 and top-K probabilities

### 4) Deployment Architecture
Components:
1. Frontend (optional for demo): Postman/curl or the LeafLens mobile app
2. Backend: FastAPI service (`banana_api/`) providing / and /predict endpoints
3. Model Service: PyTorch model loaded once at startup
4. Container: Docker image (python:3.10-slim + CPU-only PyTorch)
5. Cloud: Render/Railway for hosting

Flow: Client uploads image → API preprocesses → model inference → return JSON with predictions → client displays result.

---

## Implementation

### Repository Structure (Relevant)
- `banana_api/` – FastAPI service
  - `app.py` – routes and CORS
  - `inference.py`, `model.py` – loading and predicting
  - `requirements.txt` – pinned packages
  - `Dockerfile` – production image (CPU-only torch, gunicorn/uvicorn)
  - `.dockerignore` – excludes venv/caches/large files
- `README.md` – has quick Docker guide

### Dataset
Describe the dataset you used (fill these fields with your group’s data):
- Source: (e.g., PlantVillage Banana Leaf subset / custom field images)
- Classes: (e.g., Black Sigatoka, Banana Bunchy Top Virus, Cordana, Healthy, etc.)
- Train/Val/Test counts: ______ / ______ / ______
- Image size for training: ______ (e.g., 224×224)
- Augmentations: ______ (flip/rotate/color jitter)

### Features (I/O Contracts)
- Input
  - Format: JPEG/PNG (multipart/form-data, field name `file`)
  - Dimensions: arbitrary; server resizes/normalizes internally
- Output (JSON)
  - `top1`: { label: string, probability: float }
  - `topK`: array of top-N predictions `{label, probability}`
  - Error shape: `{ error: string }`

Error Modes
- Unsupported media type / corrupt image
- Empty payload / missing `file`
- Internal error: returns `{ error: "..." }`

---

## Using Docker for Hosting

### Steps
1) Build the Docker image locally
2) Run and test locally
3) (Optional) Tag and push to Docker Hub
4) Deploy on Render or Railway from GitHub repo or Docker image

### Commands (Windows PowerShell)

Build
```powershell
cd banana_api
# Build with CPU-only PyTorch
docker build -t leaflens-api:latest .
```

Run locally
```powershell
docker run --rm -p 8000:8000 leaflens-api:latest
```

Smoke test
```powershell
# Health check
curl http://localhost:8000/

# Predict (example using PowerShell's Invoke-RestMethod)
$resp = Invoke-RestMethod -Uri http://localhost:8000/predict/ -Method Post -Form @{ file = Get-Item "C:\\path\\to\\leaf.jpg" }
$resp | ConvertTo-Json -Depth 4
```

Tag & Push to Docker Hub (optional)
```powershell
# Replace YOUR_DOCKERHUB with your username
docker tag leaflens-api:latest YOUR_DOCKERHUB/leaflens-api:latest
docker push YOUR_DOCKERHUB/leaflens-api:latest
```

### Deploy on Render/Railway
- Create “New Web Service”
- Source: Connect your GitHub repo (Leaflens) and set service root to `banana_api/` so it picks the Dockerfile
- Port: 8000
- Instance: start with a small CPU plan; increase if you hit memory/timeouts
- Env: none required for basic demo (CORS is open by default in `app.py` for demo)

Verification
```powershell
# After deploy, replace <YOUR_URL>
curl https://<YOUR_URL>/
Invoke-RestMethod -Uri https://<YOUR_URL>/predict/ -Method Post -Form @{ file = Get-Item "C:\\path\\to\\leaf.jpg" }
```

### Screenshots to Attach
- Docker build logs (terminal)
- Container running locally and responding to GET /
- Render/Railway dashboard showing successful deploy & logs
- Sample request/response (curl or Postman)
- (Optional) Mobile app screen integrating the cloud endpoint

---

## Results and Observations (Fill with your measurements)
Model
- Inference time (CPU): ____ s/image
- Accuracy / F1 / Precision / Recall: __________
- Memory usage: ____ GB

Deployment
- Image size: ____ GB (python:3.10-slim + CPU torch)
- Cold start: ____ s
- Response time (end-to-end): ____ s
- Concurrency: able to handle ____ simultaneous requests

Lessons Learned
- Docker ensures reproducible environments and simple rollbacks
- CPU-only wheels reduce image size and avoid CUDA issues on free tiers
- Good `.dockerignore` significantly reduces context and image size
- Proper error handling and JSON responses simplify client integration

---

## Conclusion
We successfully containerized the LeafLens disease-classification backend with FastAPI and deployed it on a cloud platform using Docker. The service exposes simple endpoints for health and prediction and can be consumed by curl/Postman or the LeafLens mobile app.

## Submission Checklist
- [ ] Report PDF/DOCX generated from this Markdown
- [ ] Screenshots (build logs, dashboard, sample request/response)
- [ ] GitHub repository link
- [ ] Live service URL (Render/Railway)
- [ ] Demo image(s) and outputs

## References
- FastAPI Docs: https://fastapi.tiangolo.com
- PyTorch: https://pytorch.org
- Docker Docs: https://docs.docker.com
- Render: https://render.com / Railway: https://railway.app
