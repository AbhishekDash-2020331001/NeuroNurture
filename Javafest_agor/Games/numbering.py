import os

main_dir = "C:/Users/tarek/Downloads/Dataset_for_faceposture"

for folder_name in os.listdir(main_dir):
    folder_path = os.path.join(main_dir, folder_name)
    if not os.path.isdir(folder_path):
        continue

    # First pass: rename everything to temp names
    for idx, filename in enumerate(os.listdir(folder_path)):
        file_path = os.path.join(folder_path, filename)
        ext = os.path.splitext(filename)[1].lower()
        if ext not in [".jpg", ".jpeg", ".png"]:
            continue

        temp_name = f"temp_{idx}{ext}"
        temp_path = os.path.join(folder_path, temp_name)
        os.rename(file_path, temp_path)

    # Second pass: rename temp files to final names
    count = 1
    for filename in sorted(os.listdir(folder_path)):
        if not filename.startswith("temp_"):
            continue
        file_path = os.path.join(folder_path, filename)
        ext = os.path.splitext(filename)[1].lower()
        new_name = f"{folder_name}{count}{ext}"
        new_path = os.path.join(folder_path, new_name)
        os.rename(file_path, new_path)
        count += 1

    print(f"✅ Renamed images in '{folder_name}'")
