import cv2
import os
import time

DATASET_PATH = "dataset"
LABEL = "butterfly"
LABEL_DISPLAY = "Butterfly 🦋"
CAPTURE_INTERVAL = 1  # seconds

# Create the folder if it doesn't exist
folder_path = os.path.join(DATASET_PATH, LABEL)
os.makedirs(folder_path, exist_ok=True)

def get_next_filename(folder_path):
    files = [f for f in os.listdir(folder_path) if f.endswith(".jpg")]
    numbers = [int(f.split(".")[0]) for f in files if f.split(".")[0].isdigit()]
    next_num = max(numbers, default=-1) + 1
    return f"{next_num}.jpg"

# Start webcam
cap = cv2.VideoCapture(0)
if not cap.isOpened():
    print("❌ Camera not accessible.")
    exit()

print(f"📸 Auto-capturing '{LABEL_DISPLAY}' gesture every {CAPTURE_INTERVAL} second(s)...")
print("Press Q or ESC to stop.\n")

last_capture_time = time.time()

while True:
    ret, frame = cap.read()
    if not ret:
        print("❌ Failed to capture frame.")
        break

    # Display info on screen
    cv2.putText(frame, f"Capturing: {LABEL_DISPLAY}", (10, 30),
                cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
    cv2.imshow("Auto Gesture Capture", frame)

    key = cv2.waitKey(1) & 0xFF
    if key in [27, ord('q')]:
        print("🛑 Stopped by user.")
        break

    current_time = time.time()
    if current_time - last_capture_time >= CAPTURE_INTERVAL:
        filename = get_next_filename(folder_path)
        path = os.path.join(folder_path, filename)
        cv2.imwrite(path, frame)
        print(f"✅ Captured '{LABEL_DISPLAY}' as {filename}")
        last_capture_time = current_time

cap.release()
cv2.destroyAllWindows()