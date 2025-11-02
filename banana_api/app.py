from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import io
import inference

# Initialize the FastAPI application
app = FastAPI(title="Banana Disease Detector API")

# --- CORS Middleware Setup ---
# Crucial for allowing your Expo app (on a different host/port) to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # WARNING: Set to specific frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model ONCE when the API starts
MODEL = inference.load_model() 

@app.get("/")
def read_root():
    """Simple health check endpoint."""
    return {"status": "Banana Disease Detector API is running", "model_status": "Loaded"}

@app.post("/predict/")
async def predict_image_endpoint(file: UploadFile = File(...)):
    """API endpoint to receive an image and return predictions."""
    try:
        # Read file contents and open as PIL Image
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))

        # Run model inference -> returns dict: {class_name: probability}
        confidences = inference.predict_image(MODEL, image)

        # Build sorted topK list and top1 object
        sorted_items = sorted(confidences.items(), key=lambda kv: kv[1], reverse=True)
        topK = [{"label": k, "probability": float(v)} for k, v in sorted_items]
        top1 = topK[0] if topK else {"label": "Unknown", "probability": 0.0}

        # Return a consistent shape the app expects
        return {"top1": top1, "topK": topK, "predictions": topK}

    except Exception as e:
        # Log the error and return a 500 status message
        print(f"Inference Error: {e}")
        return {"error": "Prediction failed due to server error."}