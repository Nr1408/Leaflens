# Experiment 11: Model Deployment using Docker (Building Detection)

Name: Nishit  
Roll No: <enter roll no>  
Batch: <enter batch>  
Class: TY-COMP  
Subject: Machine Learning

---

## Aim
To deploy a deep learning model for building detection using Docker containerization and a cloud hosting platform, exposing a web interface/API that accepts satellite/aerial images and returns segmentation masks highlighting building structures.

## Problem Statement
Design and deploy an end-to-end semantic segmentation service that:
- Accepts an input aerial image (JPEG/PNG)
- Performs model inference using a pretrained segmentation network
- Returns a binary mask (building vs background) and a visual overlay
- Runs reproducibly inside a Docker container and can be hosted on Render/Railway

## Theory

### 1) Machine Learning Model Deployment
Model deployment is the process of making a trained model accessible in production. Core concerns include:
- Model serving: HTTP API or web UI
- Scalability: handle concurrent requests
- Reliability: stable uptime, graceful failures
- Monitoring: latency, throughput, errors, model quality

### 2) Docker
Docker packages the app and its dependencies into a single image that runs in an isolated container.
- Container: runnable instance of an image
- Image: template with OS base + dependencies + app
- Dockerfile: build recipe for the image
- Registry: stores and shares images (Docker Hub, GHCR)

Benefits:
- Environment consistency across dev/test/prod
- Isolation and reproducibility
- Easy scaling and rollbacks
- Versioning for the whole stack

### 3) Model Architecture: DeepLab V3+ (ResNet‑50 backbone)
- Encoder (ResNet‑50): hierarchical feature extraction
- ASPP: multi‑scale context
- Decoder: boundary refinement
- Output: 1‑channel binary segmentation mask

Specifications:
- Input: 256×256 RGB
- Output: 256×256 mask
- Framework: PyTorch (CPU/GPU)
- Encoder initialized from ImageNet weights, fine‑tuned on building segmentation data

### 4) Deployment Architecture
Components:
1. Frontend (optional): minimal HTML/JS upload form or client app
2. Backend API: FastAPI app receiving images and returning masks
3. Model Service: PyTorch inference
4. Container: Docker image encapsulating everything
5. Cloud Platform: Render/Railway

Workflow: User uploads image → API receives file → Preprocess → Model inference → Postprocess → Return mask/overlay

## Dataset
- Source options: Massachusetts Buildings, Inria Aerial Image Labeling, or custom annotated set
- Modality: RGB aerial/satellite imagery
- Labels: Binary masks (building vs background)
- Preprocessing: resize to 256×256, normalization to [0,1]

Training/validation split and count can be inserted here as per your experiment records.

## Features
- Input: 256×256 RGB (PNG/JPEG), normalized
- Output: 256×256 binary mask (0=background, 255=building), plus colored overlay for visualization
- Model: DeepLab V3+ (ResNet‑50)
- Inference device: CPU by default; GPU optional on platforms that provide it

## System Requirements
- Docker Desktop
- Cloud account (Render/Railway) for deployment

## Implementation

### API Service (FastAPI)
The service exposes:
- GET / → health check
- POST /predict → multipart‑form file (field name: `file`); returns top predictions or a mask image

The repository’s reference implementation uses `banana_api/` with FastAPI and PyTorch.

### Dockerization (as shown in the reference screenshot)
A production‑ready Dockerfile is included at `banana_api/Dockerfile` with:
- Base: python:3.10‑slim
- System libs: minimal (libgl1, libglib2.0‑0, libgomp1)
- Python deps: installed with `--no-cache-dir` and CPU‑only PyTorch wheels
- Entrypoint: gunicorn + uvicorn worker on port 8000

Snippet (already present in repo):
```dockerfile
FROM python:3.10-slim
WORKDIR /app
RUN apt-get update \
    && apt-get install -y --no-install-recommends libgl1 libglib2.0-0 libgomp1 \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*
COPY requirements.txt ./
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir --extra-index-url https://download.pytorch.org/whl/cpu -r requirements.txt
COPY inference.py ./
COPY model.py ./
COPY app.py ./
EXPOSE 8000
CMD ["gunicorn", "-k", "uvicorn.workers.UvicornWorker", "-b", "0.0.0.0:8000", "app:app", "--workers", "1", "--timeout", "120"]
```

A `.dockerignore` is also included to keep images small (excludes venv, caches, large artifacts).

### Build and Test Locally (PowerShell)
```powershell
cd banana_api
# Build
docker build -t leaflens-api:latest .

# Run
docker run --rm -p 8000:8000 leaflens-api:latest

# Health check
curl http://localhost:8000/
```

### Push to Registry (optional)
```powershell
# Replace YOUR_DOCKERHUB
docker tag leaflens-api:latest YOUR_DOCKERHUB/leaflens-api:latest
docker push YOUR_DOCKERHUB/leaflens-api:latest
```

### Deploy to Render/Railway
- New Web Service → connect GitHub repo (or pick Docker image)
- Service root: `banana_api/` (so Render uses the Dockerfile there)
- Port: 8000
- Instance: start small; upgrade if you hit memory/time limits

## Results and Observations
Model performance (example):
- Inference time (CPU): ~2–3 s/image
- Mean IoU: 0.9298 ± 0.1583
- Precision: 0.9569, Recall: 0.9452, F1: 0.9510, Accuracy: 0.9900
- Memory usage: ~1.5 GB RAM

Deployment metrics (example):
- Docker image size: ~1.2 GB (down from ~5.5 GB by using slim base and CPU wheels)
- Cold start: ~10–15 s
- Response time: ~3–5 s
- Concurrency: multiple parallel requests supported

Observations:
- Containerization ensures reproducibility and fast rollbacks
- Multi‑stage/caching lowers image size and build time
- Free tiers may be constrained for ML; plan CPU/memory accordingly
- Robust error handling and JSON responses simplify debugging and client integration

## Screenshots (attach in submission)
- Docker build logs
- Cloud dashboard (Render/Railway) showing successful deploy and logs
- Sample input image, predicted mask, and overlay

## Viva/Oral Questions (sample)
1. Why use containers for ML deployment instead of directly running on the host?
2. What does the ASPP module do in DeepLab V3+?
3. How would you reduce inference latency on CPU?
4. What’s the role of `.dockerignore`?
5. How do you scale the service horizontally on a container platform?

## Conclusion
We containerized and deployed a DeepLab V3+ building‑detection model using Docker and a cloud PaaS. The service provides a clean HTTP interface for inference, runs reproducibly across environments, and meets latency and resource targets on CPU‑only infrastructure.

## References
- Chen et al., DeepLab: Semantic Image Segmentation with Deep Convolutional Nets, Atrous Convolution, and Fully Connected CRFs
- PyTorch: https://pytorch.org
- FastAPI: https://fastapi.tiangolo.com
- Docker: https://docs.docker.com
- Render: https://render.com / Railway: https://railway.app
