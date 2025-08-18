from fastapi import FastAPI, UploadFile, File
from app.predictor import *
from app.gaze import get_gaze
from fastapi.middleware.cors import CORSMiddleware
import cv2
import threading
import mediapipe as mp


#############################################
W, H = 1920, 1080
CONF_MAP = {
    "high": "HIGH",
    "med": "MEDIUM",
    "low": "LOW"
}
last_gaze = None
mp_face_mesh = mp.solutions.face_mesh
face_mesh = mp_face_mesh.FaceMesh(refine_landmarks=True)
def gaze_tracker():
    global last_gaze
    cap = cv2.VideoCapture(0)  # open webcam
    while True:
        ret, frame = cap.read()
        frame=cv2.flip(frame,1)# horizontal flip
        if not ret:
            continue

        # Convert to RGB for MediaPipe
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = face_mesh.process(rgb_frame)

        if results.multi_face_landmarks:
            landmarks = results.multi_face_landmarks[0].landmark
            # Use right iris center as approximate gaze point
            iris = landmarks[468]  
            x, y = int(iris.x * W), int(iris.y * H)

            last_gaze = {
                "x": x,
                "y": y,
                "confidence": CONF_MAP["high"],  # we just mark as HIGH
                "screen_width": W,
                "screen_height": H
            }

threading.Thread(target=gaze_tracker, daemon=True).start()
#############################################





app = FastAPI()

# ✅ Allow CORS from React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8081"],  # Allow both ports
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
#############################################
@app.get("/current-gaze")
async def get_current_gaze():
    if last_gaze:
        return {"status": "success", "data": last_gaze}
    return {"error": "No gaze data"}
#############################################

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

@app.get("/getGaze")
async def get_gaze_data():
    """Get current eye gaze data from the eye tracker"""
    try:
        gaze_data = get_gaze()
        if "error" in gaze_data:
            return {"status": "error", "message": gaze_data["error"]}
        return {"status": "success", "data": gaze_data}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/gazeStatus")
async def get_gaze_status():
    """Get eye tracker status and screen resolution"""
    try:
        from app.gaze import W, H, api
        status = api.get_tracking_data_reception_status()
        
        # Convert the tracking status to a string representation
        if hasattr(status, 'name'):
            tracking_status = status.name
        elif hasattr(status, '__str__'):
            tracking_status = str(status)
        else:
            tracking_status = "UNKNOWN"
        
        return {
            "status": "success",
            "data": {
                "tracking_status": tracking_status,
                "screen_resolution": {"width": W, "height": H},
                "is_active": True
            }
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}
    

    
