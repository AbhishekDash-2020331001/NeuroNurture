from fastapi import FastAPI, UploadFile, File
from app.predictor import *
from fastapi.middleware.cors import CORSMiddleware
from app.gaze import get_gaze
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
gaze_thread = None
camera_active = False
def gaze_tracker():
    global last_gaze, camera_active
    cap = cv2.VideoCapture(0)  # open webcam
    while camera_active:
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
    
    # Release camera when loop ends
    cap.release()

# Camera will be started on-demand when needed
# camera_active = False  # Camera starts inactive
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

@app.post("/start-camera")
async def start_camera():
    global gaze_thread, camera_active
    if not camera_active:
        camera_active = True
        gaze_thread = threading.Thread(target=gaze_tracker, daemon=True)
        gaze_thread.start()
        return {"status": "success", "message": "Camera started"}
    return {"status": "info", "message": "Camera already running"}

@app.post("/stop-camera")
async def stop_camera():
    global gaze_thread, camera_active, last_gaze
    if camera_active:
        camera_active = False
        last_gaze = None
        return {"status": "success", "message": "Camera stopped"}
    return {"status": "info", "message": "Camera not running"}

@app.get("/camera-status")
async def get_camera_status():
    global camera_active
    return {"status": "success", "data": {"camera_active": camera_active}}

@app.post("/start-eye-tracker")
async def start_eye_tracker():
    """Manually start the Eyeware Beam eye tracker"""
    try:
        from app.gaze import initialize_eye_tracker
        initialize_eye_tracker()
        return {"status": "success", "message": "Eye tracker started"}
    except Exception as e:
        return {"status": "error", "message": str(e)}
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

@app.get("/gesture-labels")
async def get_gesture_labels():
    """Get all available gesture labels from the model"""
    try:
        from .predictor import gesture_model
        labels = gesture_model.classes_.tolist()
        return {"labels": labels, "count": len(labels)}
    except Exception as e:
        return {"error": str(e)}


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
        from app.gaze import W, H, api, initialize_eye_tracker
        if api is None:
            initialize_eye_tracker()
        
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
    


# Run the server with: uvicorn app.main:app --reload
