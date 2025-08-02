import cv2
import os

DATASET_PATH = "dataset"

# Map keys to labels (shown on screen) and folder names (no emojis)
label_map = {
    "v": ("Victory ✌️", "victory"),
    "l": ("Love 🤘", "love"),
    "o": ("Open Palm 🖐️", "open_palm"),
    "p": ("Pointing ☝️", "pointing"),
    "t": ("Thumbs Up 👍", "thumbs_up"),
    "n": ("Nice 👌", "nice"),
    "d": ("Thumbs Down 👎", "thumbs_down"),
    "x": ("None ❌", "none"),
    "c": ("Closed Fist ✊", "closed_fist"),
    "h":("heart 🫶", "heart"),
    "b":("butterfly 🦋", "butterfly"),
}

# Create folders if they don't exist
for _, folder in label_map.values():
    os.makedirs(os.path.join(DATASET_PATH, folder), exist_ok=True)

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

print("🖐️ Press the following keys to save gestures:\n")
for k, (label, folder) in label_map.items():
    print(f"{k.upper()} - {label} (=> {folder}/)")

print("\nPress Q or ESC to exit.")

while True:
    ret, frame = cap.read()
    if not ret:
        break

    cv2.putText(frame, "Press key to save gesture", (10, 30),
                cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 0), 2)
    cv2.imshow("Gesture Capture", frame)

    key = cv2.waitKey(1) & 0xFF
    if key in [27, ord('q')]:  # ESC or q
        break

    char = chr(key)
    if char in label_map:
        label_text, folder_name = label_map[char]
        folder_path = os.path.join(DATASET_PATH, folder_name)
        filename = get_next_filename(folder_path)
        path = os.path.join(folder_path, filename)
        cv2.imwrite(path, frame)
        print(f"✅ Saved {label_text}: {filename}")

cap.release()
cv2.destroyAllWindows()
