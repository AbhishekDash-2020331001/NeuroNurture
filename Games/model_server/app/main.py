from fastapi import FastAPI, UploadFile, File
from app.predictor import *
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# ✅ Allow CORS from React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8081"],  # Allow both ports
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/predictPosture")
async def predict_posture(file: UploadFile = File(...)):
    contents = await file.read()
    print("Received file:", file.filename)
    result = predict_posture_from_image_bytes(contents)
    return result

@app.post("/predictGesture")
async def predict_gesture(file: UploadFile = File(...)):
    contents = await file.read()
    print("Received file:", file.filename)
    result = predict_gesture_from_image_bytes(contents)
    return result

@app.get("/gesture-labels")
async def get_gesture_labels():
    """Get all available gesture labels from the model"""
    try:
        from .predictor import gesture_model
        labels = gesture_model.classes_.tolist()
        return {"labels": labels, "count": len(labels)}
    except Exception as e:
        return {"error": str(e)}


# Run the server with: uvicorn app.main:app --reload
