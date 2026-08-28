import os
from PIL import Image
from concurrent.futures import ProcessPoolExecutor

folder = r'c:\Users\Nikhil\Downloads\saibalaji_silverworks\backend\public\Saibalaji products S'

def optimize_webp(filename):
    if not filename.endswith('.webp'):
        return 0
    filepath = os.path.join(folder, filename)
    orig_size = os.path.getsize(filepath)

    try:
        with Image.open(filepath) as im:
            # Convert mode
            if im.mode in ('RGBA', 'LA') or (im.mode == 'P' and 'transparency' in im.info):
                im = im.convert('RGBA')
            else:
                im = im.convert('RGB')

            # Resize if max dimension > 850px for fast grid loading
            max_dim = 850
            if im.width > max_dim or im.height > max_dim:
                im.thumbnail((max_dim, max_dim), Image.Resampling.LANCZOS)

            im.save(filepath, 'WEBP', quality=78, method=6)
        
        new_size = os.path.getsize(filepath)
        return orig_size - new_size
    except Exception as e:
        print(f"Error optimizing {filename}: {e}")
        return 0

if __name__ == '__main__':
    files = [f for f in os.listdir(folder) if f.endswith('.webp')]
    print(f"Optimizing {len(files)} WebP files for instant fast web loading...")
    
    with ProcessPoolExecutor(max_workers=8) as executor:
        results = list(executor.map(optimize_webp, files))

    print("=== OPTIMIZATION COMPLETE ===")
