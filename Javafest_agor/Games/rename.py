import os

# 🔹 Set your main dataset folder
BASE_DIR = "C:/NeuroNurture/dataset"

# 🔹 Valid image extensions
IMAGE_EXTENSIONS = (".jpg", ".jpeg", ".png")

# 🔹 Loop through each subfolder
for folder_name in os.listdir(BASE_DIR):
    folder_path = os.path.join(BASE_DIR, folder_name)

    if not os.path.isdir(folder_path):
        continue  # Skip files, only process folders

    print(f"Processing folder: {folder_name}")
    
    # 🔹 List and sort images
    images = [f for f in os.listdir(folder_path) if f.lower().endswith(IMAGE_EXTENSIONS)]
    images.sort()

    # 🔹 Rename images
    for idx, img_name in enumerate(images, start=1):
        old_path = os.path.join(folder_path, img_name)
        extension = os.path.splitext(img_name)[1].lower()
        new_name = f"num{idx}{extension}"
        new_path = os.path.join(folder_path, new_name)

        os.rename(old_path, new_path)

    print(f"✅ Renamed {len(images)} images in '{folder_name}'")
