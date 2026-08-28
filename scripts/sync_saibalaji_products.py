import os
import re
import json
from concurrent.futures import ProcessPoolExecutor
from PIL import Image

workspace = r'c:\Users\Nikhil\Downloads\saibalaji_silverworks'
folder = os.path.join(workspace, 'backend', 'public', 'Saibalaji products S')
products_json_path = os.path.join(workspace, 'backend', 'products_data.json')
categories_json_path = os.path.join(workspace, 'backend', 'categories_data.json')

def clean_title(raw_name):
    name = os.path.splitext(raw_name)[0]
    name = name.replace('\xa0', ' ').replace('\ufffd', '-')
    name = re.sub(r'\s+', ' ', name).strip()
    return name

def slugify(text):
    text = text.lower()
    text = re.sub(r'[^a-z0-9]+', '-', text)
    return text.strip('-')

def convert_single_image(filename):
    png_path = os.path.join(folder, filename)
    clean_name = clean_title(filename)
    webp_filename = clean_name + '.webp'
    webp_path = os.path.join(folder, webp_filename)

    try:
        if os.path.exists(webp_path) and os.path.getsize(webp_path) > 0:
            if os.path.exists(png_path):
                os.remove(png_path)
            return webp_filename

        with Image.open(png_path) as im:
            if im.mode in ('RGBA', 'LA') or (im.mode == 'P' and 'transparency' in im.info):
                im = im.convert('RGBA')
            else:
                im = im.convert('RGB')
            
            # Resize if ultra high res e.g. > 1600px width
            max_dim = 1600
            if im.width > max_dim or im.height > max_dim:
                im.thumbnail((max_dim, max_dim), Image.Resampling.LANCZOS)

            im.save(webp_path, 'WEBP', quality=82)

        if os.path.exists(png_path):
            os.remove(png_path)
        return webp_filename
    except Exception as e:
        print(f"Error converting {filename}: {e}")
        return None

def categorize(title):
    t = title.lower()
    if any(k in t for k in ['kalash', 'pooja', 'diya', 'diyas', 'thali', 'spoon', 'cup holder', 'masala box', 'vaishnav', 'shree']):
        if 'kalash' in t:
            return 1, 'Silver Pooja Articles', 'silver-pooja-articles', 'Silver Kalash & Pots', 'SBS-PA'
        elif 'diya' in t:
            return 1, 'Silver Pooja Articles', 'silver-pooja-articles', 'Silver Diyas & Oil Lamps', 'SBS-PA'
        elif 'thali' in t or 'holder' in t:
            return 1, 'Silver Pooja Articles', 'silver-pooja-articles', 'Silver Pooja Thalis & Sets', 'SBS-PA'
        else:
            return 1, 'Silver Pooja Articles', 'silver-pooja-articles', 'Silver Pooja Spoons & Accessories', 'SBS-PA'
    elif any(k in t for k in ['idol', 'devi', 'lakshmi', 'photo frame', 'frame']):
        if 'frame' in t:
            return 3, 'Silver God & Temple Items', 'silver-god-temple-items', 'Silver Photo Frames & Sacred Displays', 'SBS-GT'
        else:
            return 3, 'Silver God & Temple Items', 'silver-god-temple-items', 'Silver Idols & Statues', 'SBS-GT'
    elif any(k in t for k in ['box', 'storage', 'gift', 'bucket', 'pot']):
        return 4, 'Silver Wedding & Return Gifts', 'silver-wedding-return-gifts', 'Silver Storage Containers & Boxes', 'SBS-WG'
    else:
        if 'tray' in t or 'platter' in t:
            return 2, 'Silver Dining & Tableware', 'silver-dining-tableware', 'Silver Serving Trays & Platters', 'SBS-DT'
        elif 'urli' in t or 'vessel' in t:
            return 2, 'Silver Dining & Tableware', 'silver-dining-tableware', 'Silver Urlis & Decorative Vessels', 'SBS-DT'
        elif 'tumbler' in t or 'glass' in t or 'cup' in t:
            return 2, 'Silver Dining & Tableware', 'silver-dining-tableware', 'Silver Tumblers & Drinkware', 'SBS-DT'
        elif 'plate' in t or 'dinner' in t:
            return 2, 'Silver Dining & Tableware', 'silver-dining-tableware', 'Silver Dinner Plates & Thali Sets', 'SBS-DT'
        else:
            return 2, 'Silver Dining & Tableware', 'silver-dining-tableware', 'Silver Bowls & Pedestal Bowls', 'SBS-DT'

def estimate_weight(title, cat_id):
    t = title.lower()
    match_set = re.search(r'(\d+)\s*(piece|pieces|cup|set)', t)
    multiplier = 1
    if match_set:
        try:
            val = int(match_set.group(1))
            if 2 <= val <= 20:
                multiplier = val / 3.0
        except:
            pass

    if 'tray' in t or 'thali' in t:
        base = 350
    elif 'urli' in t or 'kalash' in t:
        base = 250
    elif 'bowl' in t:
        base = 150
    elif 'tumbler' in t or 'glass' in t:
        base = 120
    elif 'idol' in t or 'devi' in t:
        base = 200
    elif 'frame' in t:
        base = 180
    elif 'diya' in t or 'spoon' in t:
        base = 90
    else:
        base = 160

    weight = int(round(base * multiplier, -1))
    return max(50, weight)

def sync_products():
    print("=== STEP 1: PARALLEL CONVERTING PNG IMAGES TO WEBP ===")
    png_files = [f for f in os.listdir(folder) if f.lower().endswith('.png')]
    print(f"Found {len(png_files)} PNG files to convert using multi-core processing.")

    if png_files:
        max_workers = min(16, (os.cpu_count() or 4) * 2)
        print(f"Running conversion with {max_workers} worker processes...")
        with ProcessPoolExecutor(max_workers=max_workers) as executor:
            results = list(executor.map(convert_single_image, png_files))
        print(f"Converted {len([r for r in results if r])} PNG files successfully.")

    print("\n=== STEP 2: GENERATING products_data.json ===")
    webp_files = sorted([f for f in os.listdir(folder) if f.lower().endswith('.webp')])
    print(f"Found {len(webp_files)} WebP images for catalog generation.")

    products = []
    base_silver_rate = 250.64
    current_silver_rate = 250.44

    for idx, webp_file in enumerate(webp_files, 1):
        title = os.path.splitext(webp_file)[0]
        slug = slugify(title)
        cat_id, cat_name, cat_slug, subcat, sku_prefix = categorize(title)
        sku = f"{sku_prefix}-{idx:03d}"
        weight = estimate_weight(title, cat_id)

        making_charges = int(round(weight * 25))
        silver_cost = weight * current_silver_rate
        retail_price = round(silver_cost + making_charges + 500, 1)
        wholesale_price = round(silver_cost + making_charges, 0)
        base_price = round(weight * base_silver_rate + making_charges + 500, 0)

        purity = "999 Fine Silver" if cat_id == 3 or "pure silver" in title.lower() else "925 Sterling Silver"

        image_path = f"/public/Saibalaji products S/{webp_file}"

        product = {
            "id": idx,
            "title": title,
            "slug": slug,
            "sku": sku,
            "category_id": cat_id,
            "category_name": cat_name,
            "category_slug": cat_slug,
            "subcategory": subcat,
            "product_type": "BOTH",
            "silver_purity": purity,
            "weight_g": weight,
            "retail_price": retail_price,
            "wholesale_price": wholesale_price,
            "min_wholesale_qty": 5,
            "stock": 15 + (idx % 20),
            "description": f"Exquisite handcrafted {title} by Sai Balaji Silverworks. Meticulously designed with authentic {purity} and a protective anti-tarnish luster.",
            "specifications": f"Material: {purity} | Weight: {weight}g | Guaranteed Hallmark Quality",
            "featured_image": image_path,
            "images": [image_path],
            "is_featured": (idx % 7 == 0 or idx <= 6),
            "is_new_arrival": (idx % 5 == 0 or idx <= 10),
            "is_active": True,
            "base_price": base_price,
            "base_silver_rate": base_silver_rate,
            "current_silver_rate": current_silver_rate,
            "current_price": retail_price,
            "last_silver_rate_updated_at": "2026-08-27T12:00:00.000Z",
            "gross_weight_g": weight,
            "net_silver_weight_g": weight,
            "making_charges": making_charges,
            "dimensions": ""
        }
        products.append(product)

    with open(products_json_path, 'w', encoding='utf-8') as f:
        json.dump(products, f, indent=2, ensure_ascii=False)

    print(f"Wrote {len(products)} products to backend/products_data.json")

    print("\n=== STEP 3: UPDATING categories_data.json ===")
    if os.path.exists(categories_json_path):
        with open(categories_json_path, 'r', encoding='utf-8') as f:
            categories = json.load(f)

        cat_image_map = {
            1: "/public/Saibalaji products S/Floral Engraved Silver Pooja Thali Set.webp",
            2: "/public/Saibalaji products S/Royal Floral Engraved Silver Serving Tray.webp",
            3: "/public/Saibalaji products S/Elegant Silver Lakshmi Devi Idol with Ornate Arch.webp",
            4: "/public/Saibalaji products S/Shree Divya Silver Masala Box Set.webp"
        }
        for cat in categories:
            cid = cat.get('id')
            if cid in cat_image_map:
                cat['image_url'] = cat_image_map[cid]

        with open(categories_json_path, 'w', encoding='utf-8') as f:
            json.dump(categories, f, indent=2, ensure_ascii=False)
        print("Updated backend/categories_data.json image URLs.")

    print("\n=== CATALOG SYNC COMPLETE ===")

if __name__ == '__main__':
    sync_products()
