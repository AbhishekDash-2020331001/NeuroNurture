import cv2
import mediapipe as mp
import os
import numpy as np
import time

# Gesture label
GESTURE_LABEL = "heart"

# Folder paths
LANDMARK_SAVE_PATH = "hand_gesture_data"
IMAGE_SAVE_PATH = "hand_gesture_images"

# Create directories
os.makedirs(LANDMARK_SAVE_PATH, exist_ok=True)
os.makedirs(IMAGE_SAVE_PATH, exist_ok=True)

# Initialize MediaPipe
mp_hands = mp.solutions.hands
hands = mp_hands.Hands(static_image_mode=False, max_num_hands=2)
mp_drawing = mp.solutions.drawing_utils

# Webcam
cap = cv2.VideoCapture(0)
sample_idx = 0
last_capture_time = 0  # For 1-second delay

def extract_landmarks(results):
    landmarks = []
    for hand_landmarks in results.multi_hand_landmarks:
        for lm in hand_landmarks.landmark:
            landmarks.extend([lm.x, lm.y, lm.z])
    while len(landmarks) < 126:
        landmarks.extend([0.0, 0.0, 0.0])
    return np.array(landmarks)

while True:
    ret, frame = cap.read()
    if not ret:
        break

    img_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = hands.process(img_rgb)

    # Draw landmarks if any hands are detected
    if results.multi_hand_landmarks:
        for hand_landmarks in results.multi_hand_landmarks:
            mp_drawing.draw_landmarks(frame, hand_landmarks, mp_hands.HAND_CONNECTIONS)

        current_time = time.time()
        if current_time - last_capture_time >= 1.0:  # Delay of 1 second
            # Extract and save landmarks
            landmarks = extract_landmarks(results)
            landmark_filename = os.path.join(LANDMARK_SAVE_PATH, f"{GESTURE_LABEL}_{sample_idx}.npy")
            #np.save(landmark_filename, landmarks)

            # Save image
            image_filename = os.path.join(IMAGE_SAVE_PATH, f"{GESTURE_LABEL}_{sample_idx}.jpg")
            #cv2.imwrite(image_filename, frame)

            # Update time and index
            last_capture_time = current_time
            sample_idx += 1
            print(f"✅ Saved: {landmark_filename}, {image_filename}")
            print("landmarks:", landmarks)

    cv2.putText(frame, f"Gesture: {GESTURE_LABEL}", (10, 30),
                cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 255), 2)
    cv2.imshow("Hand Gesture Capture", frame)

    if cv2.waitKey(3) & 0xFF == ord('q'):
        break

cap.release()
hands.close()
cv2.destroyAllWindows()
