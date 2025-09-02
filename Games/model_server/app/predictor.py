import cv2
import numpy as np
import joblib
import os
import uuid
from mediapipe.tasks.python import vision
from mediapipe.tasks import python
import mediapipe as mp

# Load model and label encoder
posture_model = joblib.load("app/models/mirror_posture/svm_posture_model_acc_99.0.pkl")
gesture_model = joblib.load("app/models/gesture/gesture_model_multihand_with_none.pkl")


le = joblib.load("app/models/mirror_posture/label_encoder.pkl")

# MediaPipe setup
posture_asset_path = "app/models/mirror_posture/face_landmarker.task"
gesture_asset_path = "app/models/gesture/hand_landmarker.task"

posture_base_options = python.BaseOptions(model_asset_path=posture_asset_path)
gesture_base_options = python.BaseOptions(model_asset_path=gesture_asset_path)


posture_options = vision.FaceLandmarkerOptions(
    base_options=posture_base_options,
    output_face_blendshapes=True,
    output_facial_transformation_matrixes=True,
    num_faces=1
)
gesture_options = vision.HandLandmarkerOptions(
    base_options=gesture_base_options,
    num_hands=2
)

posture_detector = vision.FaceLandmarker.create_from_options(posture_options)
gesture_detector = vision.HandLandmarker.create_from_options(gesture_options)



def predict_posture_from_image_bytes(image_bytes: bytes):
    temp_filename = f"temp_{uuid.uuid4().hex}.jpg"
    with open(temp_filename, 'wb') as f:
        f.write(image_bytes)

    try:
        mp_image = mp.Image.create_from_file(temp_filename)
        result = posture_detector.detect(mp_image)

        if result.face_landmarks:   
            landmarks = result.face_landmarks[0]
            x_vals = [lm.x for lm in landmarks]
            y_vals = [lm.y for lm in landmarks]
            z_vals = [lm.z for lm in landmarks]
            features = np.array(x_vals + y_vals + z_vals).reshape(1, -1)

            if features.shape[1] == posture_model.n_features_in_:
                proba = posture_model.predict_proba(features)[0]
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

# === Extract Features ===
def extract_hand_landmarks(result):
    landmarks = []
    for hand in result.hand_landmarks:
        for lm in hand:
            landmarks.extend([lm.x, lm.y, lm.z])
    while len(landmarks) < 126:
        landmarks.extend([0.0, 0.0, 0.0])
    return np.array(landmarks)


def predict_gesture_from_image_bytes(image_bytes: bytes):
    temp_filename = f"temp_{uuid.uuid4().hex}.jpg"
    with open(temp_filename, 'wb') as f:
        f.write(image_bytes)

    try:
        mp_image = mp.Image.create_from_file(temp_filename)
        result = gesture_detector.detect(mp_image)

        if result.hand_landmarks:
            landmarks = extract_hand_landmarks(result)
            input_data = landmarks.reshape(1, -1)

            probs = gesture_model.predict_proba(input_data)[0]
            max_prob = np.max(probs)
            prediction = gesture_model.classes_[np.argmax(probs)]
            
            # Debug: Print all available classes and the prediction
            print(f"Available gesture classes: {gesture_model.classes_}")
            print(f"Predicted gesture: {prediction} (confidence: {max_prob})")

            if max_prob >= 0.8:
                return {
                    "prediction": prediction,
                    "confidence": float(max_prob)
                }
            else:
                return {
                    "prediction": "none",
                    "confidence": float(max_prob)
                }
        else:
            return {
                "prediction": "no_hands_detected",
                "confidence": 0.0
            }
    except Exception as e:
        return {
            "prediction": "error",
            "confidence": 0.0
        }
    finally:
        if os.path.exists(temp_filename):
            os.remove(temp_filename)
