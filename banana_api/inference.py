import torch
from torchvision import transforms
from PIL import Image
from model import HybridCNNViT
import torch.nn.functional as F
import io

# --- Configuration (Must match your training setup) ---
DEVICE = torch.device("cpu") 
NUM_CLASSES = 9
CHECKPOINT_PATH = "best_model.pth"
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

def load_model():
    """Instantiates the model and loads weights."""
    print(f"Loading model from {CHECKPOINT_PATH} on {DEVICE}...")
    loaded_model = HybridCNNViT(NUM_CLASSES).to(DEVICE)
    # map_location='cpu' ensures compatibility if saved with CUDA
    checkpoint = torch.load(CHECKPOINT_PATH, map_location=DEVICE) 
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