import cv2
import numpy as np
import joblib
import time
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision

# === Load Model ===
model = joblib.load("gesture_model.pkl")

# === Label Map ===
label_map = {
    "victory": "Victory ✌️",
    "love": "Love 🤘",
    "open_palm": "Open Palm 🖐️",
    "pointing_up": "Pointing ☝️",
    "thumbs_up": "Thumbs Up 👍",
    "nice": "Nice 👌",
    "thumbs_down": "Thumbs Down 👎",
    "none": "None ❌",
    "closed_fist": "Closed Fist ✊",
    "heart": "Heart 🫶"
}

# === Create HandLandmarker ===
model_path = "hand_landmarker.task"
base_options = python.BaseOptions(model_asset_path=model_path)
options = vision.HandLandmarkerOptions(base_options=base_options, num_hands=2)
detector = vision.HandLandmarker.create_from_options(options)

# === Draw Helper ===
def draw_landmarks(frame, landmarks_list):
    height, width, _ = frame.shape
    for idx, hand_landmarks in enumerate(landmarks_list):
        for i, lm in enumerate(hand_landmarks):
            cx, cy = int(lm.x * width), int(lm.y * height)
            color = (0, 255, 0) if idx == 0 else (255, 0, 0)
            cv2.circle(frame, (cx, cy), 3, color, -1)

# === Extract Features ===
def extract_landmarks(result):
    landmarks = []
    for hand in result.hand_landmarks:
        for lm in hand:
            landmarks.extend([lm.x, lm.y, lm.z])
    while len(landmarks) < 126:
        landmarks.extend([0.0, 0.0, 0.0])
    return np.array(landmarks)

# === Webcam Feed ===
cap = cv2.VideoCapture(0)
print("🖐️ Real-time gesture recognition started... Press 'q' to quit.")

while True:
    ret, frame = cap.read()
    if not ret:
        break

    # Convert BGR to RGB and wrap as MP Image
    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb_frame)

    # Detect
    result = detector.detect(mp_image)

    if result.hand_landmarks:
        # Feature extraction and prediction
        landmarks = extract_landmarks(result)
        print(landmarks)
        input_data = landmarks.reshape(1, -1)
        prediction = model.predict(input_data)[0]
        gesture = label_map.get(prediction, "Unknown")

        # Draw landmarks
        draw_landmarks(frame, result.hand_landmarks)

        # Info overlay
        cv2.putText(frame, f"Gesture: {gesture}", (10, 40), cv2.FONT_HERSHEY_SIMPLEX,
                    1.0, (0, 255, 0), 2)
        cv2.putText(frame, f"Hands detected: {len(result.hand_landmarks)}", (10, 80), cv2.FONT_HERSHEY_SIMPLEX,
                    0.7, (255, 255, 255), 2)

    cv2.imshow("Real-Time Gesture Recognition", frame)


    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

cap.release()
cv2.destroyAllWindows()
