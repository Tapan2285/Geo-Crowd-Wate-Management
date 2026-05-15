import io
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from PIL import Image
import torch
from transformers import pipeline

app = FastAPI(title="Waste Detection AI Service")

# Allow CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class DetectionResponse(BaseModel):
    is_waste: bool
    confidence: float
    message: str

print("Loading Hugging Face Zero-Shot Classification Model (CLIP)...")
# Using CLIP for highly accurate zero-shot image classification
classifier = pipeline("zero-shot-image-classification", model="openai/clip-vit-base-patch32")
print("Model loaded successfully.")

# We define specific labels for the model to choose between.
# A high probability for waste labels indicates the image contains garbage.
CANDIDATE_LABELS = [
    "a pile of garbage, scattered trash, litter",
    "a garbage bin, trash can filled with waste",
    "a clean street, beautiful landscape, empty road",
    "a person, face, human",
    "an animal, pet, dog, cat"
]

@app.post("/detect", response_model=DetectionResponse)
async def detect_waste(file: UploadFile = File(...)):
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File provided is not an image.")
    
    contents = await file.read()
    print(f"Received file of length: {len(contents)}")
    try:
        input_image = Image.open(io.BytesIO(contents)).convert("RGB")
    except Exception as e:
        raise HTTPException(status_code=400, detail="Invalid image file.")
        
    try:
        # Run inference
        results = classifier(input_image, candidate_labels=CANDIDATE_LABELS)
        
        # Results format: [{'score': 0.99, 'label': '...'}, ...]
        best_match = results[0]
        
        is_waste = False
        confidence = best_match['score']
        
        if "garbage" in best_match['label'] or "trash" in best_match['label']:
            is_waste = True
            
        if is_waste:
            return {
                "is_waste": True,
                "confidence": round(confidence, 4),
                "message": f"Waste detected: {best_match['label']}."
            }
        else:
            return {
                "is_waste": False,
                "confidence": round(confidence, 4),
                "message": f"Detected '{best_match['label']}'. Please point the camera at actual waste."
            }
            
    except Exception as e:
        print("Error during inference:", e)
        raise HTTPException(status_code=500, detail="AI inference failed.")

@app.get("/")
def read_root():
    return {"message": "Waste Detection API is running. Use /detect endpoint."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
