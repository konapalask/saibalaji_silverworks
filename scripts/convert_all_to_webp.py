import os
import sys
import re
from PIL import Image

def run_conversion():
    workspace = r'c:\Users\Nikhil\Downloads\saibalaji_silverworks'
    app_workspace = r'c:\Users\Nikhil\Downloads\sai-balaji-silver-app'
    projects = [workspace, app_workspace]

    valid_exts = ('.webp', '.webp', '.webp', '.webp', '.webp', '.webp')
    ignored_dirs = {'node_modules', 'dist', '.git', 'build', '.expo', '.next', 'python_backup'}

    converted_count = 0
    total_orig_bytes = 0
    total_webp_bytes = 0
    file_mapping = {}

    print("=== STEP 1: CONVERTING IMAGES TO WEBP ===", flush=True)

    for project in projects:
        if not os.path.exists(project):
            continue
        print(f"Scanning directory: {project}", flush=True)
        for root, dirs, files in os.walk(project):
            dirs[:] = [d for d in dirs if d not in ignored_dirs]
            for f in files:
                ext = os.path.splitext(f)[1]
                if ext in valid_exts and ext.lower() != '.webp':
                    orig_path = os.path.join(root, f)
                    webp_name = os.path.splitext(f)[0] + '.webp'
                    webp_path = os.path.join(root, webp_name)
                    
                    try:
                        orig_size = os.path.getsize(orig_path)
                        with Image.open(orig_path) as im:
                            if im.mode in ('RGBA', 'LA') or (im.mode == 'P' and 'transparency' in im.info):
                                im = im.convert('RGBA')
                            else:
                                im = im.convert('RGB')
                            im.save(webp_path, 'WEBP', quality=85, optimize=True)
                        
                        webp_size = os.path.getsize(webp_path)
                        total_orig_bytes += orig_size
                        total_webp_bytes += webp_size
                        converted_count += 1
                        file_mapping[f] = webp_name
                        
                        # Remove original image file after successful conversion
                        os.remove(orig_path)
                    except Exception as e:
                        print(f"Error converting {orig_path}: {e}", flush=True)

    print(f"\nCompleted Image Conversion:", flush=True)
    print(f"Total images converted: {converted_count}", flush=True)
    if total_orig_bytes > 0:
        saved_bytes = total_orig_bytes - total_webp_bytes
        print(f"Original total size: {total_orig_bytes / (1024*1024):.2f} MB", flush=True)
        print(f"New WebP total size: {total_webp_bytes / (1024*1024):.2f} MB", flush=True)
        print(f"Space saved: {saved_bytes / (1024*1024):.2f} MB ({(saved_bytes/total_orig_bytes)*100:.1f}%)", flush=True)

    print("\n=== STEP 2: UPDATING CODE AND DATA REFERENCES ===", flush=True)

    # Extensions to update in codebase
    target_code_exts = ('.json', '.js', '.jsx', '.ts', '.tsx', '.html', '.css', '.py')
    pattern = re.compile(r'\.(png|jpg|jpeg|PNG|JPG|JPEG)\b')

    modified_files = []

    for project in projects:
        if not os.path.exists(project):
            continue
        for root, dirs, files in os.walk(project):
            dirs[:] = [d for d in dirs if d not in ignored_dirs]
            for f in files:
                if f.endswith(target_code_exts):
                    file_path = os.path.join(root, f)
                    try:
                        with open(file_path, 'r', encoding='utf-8', errors='ignore') as fp:
                            content = fp.read()
                        
                        new_content, count = pattern.subn('.webp', content)
                        if count > 0:
                            with open(file_path, 'w', encoding='utf-8') as fp:
                                fp.write(new_content)
                            modified_files.append((file_path, count))
                    except Exception as e:
                        print(f"Error updating references in {file_path}: {e}", flush=True)

    print(f"Updated references in {len(modified_files)} files:", flush=True)
    for path, replacements in modified_files:
        rel_path = os.path.relpath(path, r'c:\Users\Nikhil\Downloads')
        print(f" - {rel_path} ({replacements} replacements)", flush=True)

    print("\n=== WEBP CONVERSION AND UPDATE COMPLETE ===", flush=True)

if __name__ == '__main__':
    run_conversion()
