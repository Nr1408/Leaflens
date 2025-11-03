param(
  [string]$ImageName = "leaflens-api:latest",
  [string]$ModelPath = "C:\LeafLens\banana_api\best_model.pth",
  [switch]$Download
)

$ErrorActionPreference = 'Stop'

Write-Host "[1/4] Building Docker image $ImageName ..." -ForegroundColor Cyan
pushd (Join-Path $PSScriptRoot "..\banana_api")
docker build -t $ImageName .
popd

Write-Host "[2/4] Starting container on port 8000 ..." -ForegroundColor Cyan
if ($Download) {
  if (-not $env:MODEL_URL) { Write-Error "Set $env:MODEL_URL to a direct download URL before using -Download." }
  docker run --rm -p 8000:8000 `
    -e MODEL_URL=$env:MODEL_URL `
    -e MODEL_PATH=/app/best_model.pth `
    $ImageName
}
else {
  if (-not (Test-Path $ModelPath)) { Write-Error "Model not found at $ModelPath. Provide -Download or update -ModelPath." }
  docker run --rm -p 8000:8000 `
    -v ${ModelPath}:/app/best_model.pth:ro `
    -e MODEL_PATH=/app/best_model.pth `
    $ImageName
}
