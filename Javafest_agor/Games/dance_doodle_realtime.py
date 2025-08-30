import cv2
import mediapipe as mp
import numpy as np
import joblib
from mediapipe.tasks import python
from mediapipe.tasks.python import vision

# -------------------------
# Load trained model & encoder
# -------------------------
dt_model = joblib.load("c:/NeuroNurture/Javafest_agor/Games/dance_doodle_decision_tree_model.pkl")
encoder = joblib.load("c:/NeuroNurture/Javafest_agor/Games/dance_doodle_label_encoder.pkl")

# Number of features expected by the model
NUM_FEATURES = dt_model.n_features_in_

# -------------------------
# Initialize MediaPipe PoseLandmarker
# -------------------------
MODEL_PATH = r"c:/NeuroNurture/Javafest_agor/Games/pose_landmarker.task"
base_options = python.BaseOptions(model_asset_path=MODEL_PATH)
options = vision.PoseLandmarkerOptions(
    base_options=base_options,
    output_segmentation_masks=False,
    running_mode=vision.RunningMode.IMAGE  # <-- Change to IMAGE for synchronous detection
)
detector = vision.PoseLandmarker.create_from_options(options)

# -------------------------
# Helper to extract landmarks
# -------------------------
def extract_landmarks_from_frame(frame):
    mp_image = mp.Image(
        image_format=mp.ImageFormat.SRGB,
        data=cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    )
    result = detector.detect(mp_image)
    if not result.pose_landmarks:
        return None
    coords = []
    for lm in result.pose_landmarks[0]:
        coords.extend([lm.x, lm.y, lm.z, lm.visibility])
    return np.array(coords).reshape(1, -1)

# -------------------------
# Start webcam
# -------------------------
cap = cv2.VideoCapture(0)

while True:
    ret, frame = cap.read()
    if not ret:
        break

    landmarks = extract_landmarks_from_frame(frame)
    if landmarks is not None and landmarks.shape[1] == NUM_FEATURES:
        # Predict pose label
        pred_idx = dt_model.predict(landmarks)[0]
        label = encoder.inverse_transform([pred_idx])[0]
        # Display label
        cv2.putText(frame, label, (10, 50), cv2.FONT_HERSHEY_SIMPLEX, 1.2, (0, 255, 0), 2)

    cv2.imshow("Decision Tree Pose Recognition", frame)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
