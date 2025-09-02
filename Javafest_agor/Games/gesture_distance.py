import math
import mediapipe as mp
import cv2

# Initialize MediaPipe
mp_hands = mp.solutions.hands
mp_drawing = mp.solutions.drawing_utils

# ==== Utility Functions ====
def calc_distance(p1, p2):
    return math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2)

def is_thumb_up(landmarks):
    # Thumb tip higher than index MCP
    return landmarks[4].y < landmarks[5].y

def is_open_palm(landmarks):
    # Check if all fingertips are spread
    d1 = calc_distance(landmarks[4], landmarks[8])
    d2 = calc_distance(landmarks[8], landmarks[12])
    d3 = calc_distance(landmarks[12], landmarks[16])
    return d1 > 0.15 and d2 > 0.15 and d3 > 0.15

def detect_gesture(landmarks):
    if is_thumb_up(landmarks):
        return "Thumbs Up"
    elif is_open_palm(landmarks):
        return "Open Palm"
    return "None"

# ==== Main Loop ====
cap = cv2.VideoCapture(0)

with mp_hands.Hands(static_image_mode=False, max_num_hands=1, min_detection_confidence=0.5) as hands:
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        # Convert image to RGB
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = hands.process(rgb)

        gesture = "None"
        if results.multi_hand_landmarks:
            for hand_landmarks in results.multi_hand_landmarks:
                gesture = detect_gesture(hand_landmarks.landmark)
                mp_drawing.draw_landmarks(frame, hand_landmarks, mp_hands.HAND_CONNECTIONS)

        cv2.putText(frame, f"Gesture: {gesture}", (10, 50),
                    cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 0, 0), 2)
        cv2.imshow("Gesture Detection", frame)

        if cv2.waitKey(5) & 0xFF == 27:
            break

cap.release()
cv2.destroyAllWindows()
