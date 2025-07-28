from fastapi import FastAPI, UploadFile, File
from app.predictor import predict_posture_from_image_bytes
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# ✅ Allow CORS from React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Or ["*"] for all
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/predict")
async def predict_posture(file: UploadFile = File(...)):
    contents = await file.read()
    print("Received file:", file.filename)
    result = predict_posture_from_image_bytes(contents)
    return result

# Run the server with: uvicorn app.main:app --reload
