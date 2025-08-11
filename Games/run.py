import cv2
import numpy as np
import joblib
import os
import time

from mediapipe.tasks.python import vision
from mediapipe.tasks import python

import mediapipe as mp

# Load model and label encoder
logistic_model="logisticregression_posture_model_acc_99.0.pkl"
svm_model="svm_posture_model_acc_99.0.pkl"
mlp_model="mlp_posture_model_acc_99.0.pkl"

model = joblib.load(svm_model)
le = joblib.load("label_encoder.pkl")

# Set up MediaPipe face landmark detector
model_asset_path = "face_landmarker.task"

base_options = python.BaseOptions(model_asset_path=model_asset_path)
options = vision.FaceLandmarkerOptions(
    base_options=base_options,
    output_face_blendshapes=True,
    output_facial_transformation_matrixes=True,
    num_faces=1
)
detector = vision.FaceLandmarker.create_from_options(options)

# Webcam capture
cap = cv2.VideoCapture(0)

temp_img_path = "temp_frame.jpg"

while cap.isOpened():
    # delay 5 seconds to allow camera to warm up

    ret, frame = cap.read()
    if not ret:
        break

    # Save frame temporarily
    cv2.imwrite(temp_img_path, frame)

    try:
        # Use MediaPipe's create_from_file
        mp_image = mp.Image.create_from_file(temp_img_path)
        result = detector.detect(mp_image)
    except Exception as e:
        print("Error:", e)
        continue

    if result.face_landmarks:
        landmarks = result.face_landmarks[0]

        x_vals = [lm.x for lm in landmarks]
        y_vals = [lm.y for lm in landmarks]
        z_vals = [lm.z for lm in landmarks]

        features = np.array(x_vals + y_vals + z_vals).reshape(1, -1)

        if features.shape[1] == model.n_features_in_:
            proba = model.predict_proba(features)[0]  # Get probability for each class
            pred_class_index = np.argmax(proba)
            confidence = proba[pred_class_index]
            print(proba)
            print(f"Predicted class index: {pred_class_index}, Confidence: {confidence}")

            if confidence >= 0.5:
                label = le.inverse_transform([pred_class_index])[0]
            else:
                label = "None"

            cv2.putText(frame, f'posture: {label}', (10, 30),
                        cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
        else:
            cv2.putText(frame, f'Invalid feature size: {features.shape[1]}', (10, 30),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)
    
    cv2.imshow("Real-Time posture Detection", frame)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break
    #time.sleep(1)  # Delay for 0.5 seconds before next frame

# Cleanup
cap.release()
cv2.destroyAllWindows()
if os.path.exists(temp_img_path):
    os.remove(temp_img_path)
