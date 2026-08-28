import os
import re

backend_dir = r'c:\Users\Nikhil\Downloads\saibalaji_silverworks\backend'
frontend_dir = r'c:\Users\Nikhil\Downloads\saibalaji_silverworks\frontend\src'

real_images = {
    'god': '/public/Saibalaji products S/Elegant Silver Lakshmi Devi Idol with Ornate Arch.webp',
    'pooja': '/public/Saibalaji products S/Floral Engraved Silver Pooja Thali Set.webp',
    'dining': '/public/Saibalaji products S/Royal Floral Engraved Silver Serving Tray.webp',
    'baby': '/public/Saibalaji products S/Classic Cartoon Star Border Silver Serving Tray.webp',
    'wedding': '/public/Saibalaji products S/Shree Divya Silver Masala Box Set.webp',
    'default': '/public/Saibalaji products S/Antique Lakshmi Motif Pure Silver Kalash.webp'
}

print("=== REMOVING DUMMY IMAGES & REPLACING WITH REAL PRODUCTS ===")

# Update JSON files in backend
for json_file in ['products_data.json', 'db_export.json', 'categories_data.json']:
    path = os.path.join(backend_dir, json_file)
    if os.path.exists(path):
        with open(path, 'r', encoding='utf-8', errors='ignore') as fp:
            content = fp.read()
        
        new_content = content
        new_content = re.sub(r'/[^\"]*download\.webp', real_images['god'], new_content)
        new_content = re.sub(r'/[^\"]*images\.webp', real_images['dining'], new_content)
        
        if new_content != content:
            with open(path, 'w', encoding='utf-8') as fp:
                fp.write(new_content)
            print(f"Updated backend/{json_file}")

# Update frontend TSX/TS files
for root, dirs, files in os.walk(frontend_dir):
    for f in files:
        if f.endswith(('.ts', '.tsx')):
            file_path = os.path.join(root, f)
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as fp:
                content = fp.read()
            
            new_content = content
            new_content = re.sub(r'/[^\"]*download\.webp', real_images['god'], new_content)
            new_content = re.sub(r'/[^\"]*images\.webp', real_images['dining'], new_content)
            
            if new_content != content:
                with open(file_path, 'w', encoding='utf-8') as fp:
                    fp.write(new_content)
                print(f"Updated frontend/{f}")

print("=== REPLACEMENT COMPLETE ===")
