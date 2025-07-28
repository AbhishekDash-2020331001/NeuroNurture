from fastapi import FastAPI, UploadFile, File
from app.predictor import predict_posture_from_image_bytes

app = FastAPI()

@app.post("/predict")
async def predict_posture(file: UploadFile = File(...)):
    contents = await file.read()
    print("Received file:", file.filename)
    result = predict_posture_from_image_bytes(contents)
    return result
