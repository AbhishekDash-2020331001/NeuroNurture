from fastapi import FastAPI, UploadFile, File
from app.predictor import *
from fastapi.middleware.cors import CORSMiddleware
from app.gaze import get_gaze
import cv2
import threading
import mediapipe as mp

#############################################
# MediaPipe Implementation (KEPT BUT NOT USED)
# This code is preserved for reference but the endpoints use Beam Eye Tracker
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
    """MediaPipe gaze tracking function (KEPT BUT NOT USED)"""
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
    """Get current gaze data from Beam Eye Tracker (MediaPipe code kept but not used)"""
    try:
        gaze_data = get_gaze()
        if "error" in gaze_data:
            return {"status": "error", "message": gaze_data["error"]}
        return {"status": "success", "data": gaze_data}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.post("/start-camera")
async def start_camera():
    """Start the Beam Eye Tracker (MediaPipe code kept but not used)"""
    try:
        from app.gaze import initialize_eye_tracker
        initialize_eye_tracker()
        return {"status": "success", "message": "Beam Eye Tracker started"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.post("/stop-camera")
async def stop_camera():
    """Stop the Beam Eye Tracker (MediaPipe code kept but not used)"""
    try:
        from app.gaze import api
        if api is not None:
            api.stop_the_beam_eye_tracker()
            return {"status": "success", "message": "Beam Eye Tracker stopped"}
        return {"status": "info", "message": "Beam Eye Tracker not running"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/camera-status")
async def get_camera_status():
    """Get Beam Eye Tracker status (MediaPipe code kept but not used)"""
    try:
        from app.gaze import api
        if api is not None:
            try:
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
                        "active": True,
                        "tracking_status": tracking_status
                    }
                }
            except Exception as api_error:
                # If we can't get status, but API exists, assume it's active
                return {
                    "status": "success", 
                    "data": {
                        "active": True,
                        "tracking_status": "UNKNOWN"
                    }
                }
        return {"status": "success", "data": {"active": False}}
    except Exception as e:
        return {"status": "error", "message": str(e)}

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

@app.get("/test-gaze")
async def test_gaze():
    """Test endpoint to check if gaze data is available"""
    try:
        from app.gaze import get_gaze
        gaze_data = get_gaze()
        return {
            "status": "success",
            "data": gaze_data,
            "message": "Gaze test completed"
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/calibration-status")
async def get_calibration_status():
    """Check if the Beam Eye Tracker is properly calibrated"""
    try:
        from app.gaze import get_gaze
        gaze_data = get_gaze()
        
        if "error" in gaze_data:
            return {
                "status": "needs_calibration",
                "message": gaze_data["error"],
                "data": gaze_data
            }
        
        # Check if we have valid data
        if gaze_data.get("confidence") in ["LOST_TRACKING", "LOW"]:
            return {
                "status": "needs_calibration",
                "message": "Eye tracker needs better calibration",
                "data": gaze_data
            }
        
        return {
            "status": "calibrated",
            "message": "Eye tracker is properly calibrated",
            "data": gaze_data
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/beam-status")
async def get_beam_status():
    """Check the status of the Beam Eye Tracker connection"""
    try:
        from app.gaze import api
        if api is None:
            return {
                "status": "not_connected",
                "message": "Beam Eye Tracker API not initialized",
                "data": None
            }
        
        # Try to get tracking status
        try:
            tracking_status = api.get_tracking_data_reception_status()
            return {
                "status": "connected",
                "message": f"Beam Eye Tracker connected - Status: {tracking_status}",
                "data": {
                    "tracking_status": str(tracking_status),
                    "api_initialized": True
                }
            }
        except Exception as e:
            return {
                "status": "connection_error",
                "message": f"Error getting tracking status: {str(e)}",
                "data": {
                    "api_initialized": True,
                    "error": str(e)
                }
            }
    except Exception as e:
        return {"status": "error", "message": str(e)}
    


# Run the server with: uvicorn app.main:app --reload
