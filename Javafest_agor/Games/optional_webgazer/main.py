import cv2
import mediapipe as mp
import threading
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Screen size (adjust to your actual screen)
W, H = 1920, 1080

CONF_MAP = {
    "high": "HIGH",
    "med": "MEDIUM",
    "low": "LOW"
}

# Last gaze data
last_gaze = None

# Allow CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mediapipe Face Mesh for eye tracking
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


# Run gaze tracker in background
threading.Thread(target=gaze_tracker, daemon=True).start()


@app.get("/current-gaze")
async def get_current_gaze():
    if last_gaze:
        return {"status": "success", "data": last_gaze}
    return {"error": "No gaze data"}
