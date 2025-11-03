import os
import urllib.request
import torch
from torchvision import transforms
from PIL import Image
from model import HybridCNNViT
import torch.nn.functional as F
import io

# --- Configuration (Must match your training setup) ---
DEVICE = torch.device("cpu") 
NUM_CLASSES = 9
# Allow overriding model path and URL via environment for Docker-friendly usage
CHECKPOINT_PATH = os.environ.get("MODEL_PATH", "best_model.pth")
CHECKPOINT_URL = os.environ.get("MODEL_URL")
CLASS_NAMES = [
    'Anthracnose', 'Banana Fruit-Scarring Beetle', 'Banana Skipper Damage', 
    'Banana Split Peel', 'Black and Yellow Sigatoka', 'Chewing insect damage on banana leaf', 
    'Healthy Banana', 'Healthy Banana leaf', 'Panama Wilt Disease'
]

# --- Inference Transform (Copied from your notebook's validation/inference step) ---
base_inference_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.5, 0.5, 0.5], [0.5, 0.5, 0.5])
])

def _ensure_checkpoint_available():
    """Ensure the checkpoint exists locally; if not and a URL is provided, download it."""
    if os.path.exists(CHECKPOINT_PATH):
        return CHECKPOINT_PATH
    if CHECKPOINT_URL:
        os.makedirs(os.path.dirname(CHECKPOINT_PATH) or ".", exist_ok=True)
        print(f"Checkpoint not found at {CHECKPOINT_PATH}. Downloading from {CHECKPOINT_URL}...")
        try:
            # Stream download to file to avoid memory spikes
            with urllib.request.urlopen(CHECKPOINT_URL) as resp, open(CHECKPOINT_PATH, 'wb') as out:
                total = int(resp.headers.get('Content-Length', 0)) or None
                chunk = 1024 * 1024
                downloaded = 0
                while True:
                    data = resp.read(chunk)
                    if not data:
                        break
                    out.write(data)
                    downloaded += len(data)
                    if total:
                        pct = downloaded * 100.0 / total
                        print(f"Downloaded {downloaded/1_048_576:.1f} MB / {total/1_048_576:.1f} MB ({pct:.1f}%)", end='\r')
            print("\nDownload complete.")
        except Exception as e:
            print(f"Failed to download checkpoint: {e}")
            raise
        return CHECKPOINT_PATH
    raise FileNotFoundError(f"Checkpoint not found and MODEL_URL not provided. Expected at: {CHECKPOINT_PATH}")

def load_model():
    """Instantiates the model and loads weights."""
    ckpt_path = _ensure_checkpoint_available()
    print(f"Loading model from {ckpt_path} on {DEVICE}...")
    loaded_model = HybridCNNViT(NUM_CLASSES).to(DEVICE)
    # map_location='cpu' ensures compatibility if saved with CUDA
    checkpoint = torch.load(ckpt_path, map_location=DEVICE)
    loaded_model.load_state_dict(checkpoint['model_state_dict'])
    loaded_model.eval()
    print("Model loaded successfully.")
    return loaded_model

def predict_image(loaded_model, pil_image: Image.Image):
    """Performs inference on a PIL image."""
    if pil_image.mode != 'RGB':
        pil_image = pil_image.convert('RGB')
        
    input_tensor = base_inference_transform(pil_image).unsqueeze(0).to(DEVICE)
    
    with torch.no_grad():
        output = loaded_model(input_tensor)
        probabilities = F.softmax(output[0], dim=0)

    # Format output as a dictionary of class names and probabilities
    confidences = {CLASS_NAMES[i]: probabilities[i].item() for i in range(NUM_CLASSES)}
    return confidences