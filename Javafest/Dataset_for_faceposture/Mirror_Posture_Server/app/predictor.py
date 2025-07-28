import cv2
import numpy as np
import joblib
import os
import uuid

from mediapipe.tasks.python import vision
from mediapipe.tasks import python
import mediapipe as mp

# Load model and label encoder
model = joblib.load("app/models/mirror_posture/svm_posture_model_acc_99.0.pkl")
le = joblib.load("app/models/mirror_posture/label_encoder.pkl")

# MediaPipe setup
model_asset_path = "app/models/mirror_posture/face_landmarker.task"
base_options = python.BaseOptions(model_asset_path=model_asset_path)
options = vision.FaceLandmarkerOptions(
    base_options=base_options,
    output_face_blendshapes=True,
    output_facial_transformation_matrixes=True,
    num_faces=1
)
detector = vision.FaceLandmarker.create_from_options(options)

def predict_posture_from_image_bytes(image_bytes: bytes):
    temp_filename = f"temp_{uuid.uuid4().hex}.jpg"
    with open(temp_filename, 'wb') as f:
        f.write(image_bytes)

    try:
        mp_image = mp.Image.create_from_file(temp_filename)
        result = detector.detect(mp_image)

        if result.face_landmarks:   
            landmarks = result.face_landmarks[0]
            x_vals = [lm.x for lm in landmarks]
            y_vals = [lm.y for lm in landmarks]
            z_vals = [lm.z for lm in landmarks]
            features = np.array(x_vals + y_vals + z_vals).reshape(1, -1)

            if features.shape[1] == model.n_features_in_:
                proba = model.predict_proba(features)[0]
                pred_class_index = np.argmax(proba)
                confidence = float(proba[pred_class_index])

                if confidence >= 0.5:
                    label = le.inverse_transform([pred_class_index])[0]
                else:
                    label = "None"

                return {
                    "prediction": label,
                    "confidence": confidence
                }
            else:
                return {"error": "Invalid feature size."}
        else:
            return {"error": "No face landmarks detected."}

    except Exception as e:
        return {"error": str(e)}
    finally:
        if os.path.exists(temp_filename):
            os.remove(temp_filename)
