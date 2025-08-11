import os
import cv2

# Set your source and destination folders
source_folder = "right"       # e.g., "images/"
destination_folder = "left"  # e.g., "images_flipped/"

# Create destination folder if it doesn't exist
os.makedirs(destination_folder, exist_ok=True)

# Process each image in the source folder
for filename in os.listdir(source_folder):
    if filename.lower().endswith(('.jpg', '.jpeg', '.png')):
        path = os.path.join(source_folder, filename)
        img = cv2.imread(path)

        if img is None:
            print(f"⚠ Could not read {path}")
            continue

        # Flip the image horizontally
        flipped_img = cv2.flip(img, 1)

        # Save to destination folder
        flipped_path = os.path.join(destination_folder, filename)
        cv2.imwrite(flipped_path, flipped_img)
        print(f"✅ Saved flipped image: {flipped_path}")
