# syntax=docker/dockerfile:1
# Leaflens Banana API - Dockerfile (CPU-only PyTorch + FastAPI)
# Optimized for smaller size using python:3.10-slim and no pip cache

FROM python:3.10-slim

WORKDIR /app

# Install minimal OS packages required by Pillow/torch
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       libgl1 \
       libglib2.0-0 \
       libgomp1 \
         libjpeg62-turbo \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Copy only requirements first to leverage Docker layer caching
COPY requirements.txt ./

# Install Python deps
# Use PyTorch CPU wheels to keep image size smaller and avoid CUDA
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir --extra-index-url https://download.pytorch.org/whl/cpu -r requirements.txt \
    && rm -rf ~/.cache/pip

# Copy application code (order matters for build cache)
COPY inference.py ./
COPY model.py ./
COPY app.py ./
COPY static ./static

# Create directories for uploads/results if app needs them (safe no-op otherwise)
RUN mkdir -p static/uploads static/results

# Expose API port
EXPOSE 8000

# Environment
ENV PYTHONUNBUFFERED=1 \
    UVICORN_HOST=0.0.0.0 \
    UVICORN_PORT=8000 \
    UVICORN_WORKERS=1

# Start the API using Gunicorn with Uvicorn workers
CMD ["gunicorn", "-k", "uvicorn.workers.UvicornWorker", "-b", "0.0.0.0:8000", "app:app", "--workers", "1", "--timeout", "120"]
