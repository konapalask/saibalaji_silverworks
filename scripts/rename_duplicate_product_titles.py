import json
import re

products_path = r'c:\Users\Nikhil\Downloads\saibalaji_silverworks\backend\products_data.json'

with open(products_path, 'r', encoding='utf-8') as f:
    products = json.load(f)

def slugify(text):
    text = text.lower()
    text = re.sub(r'[^a-z0-9]+', '-', text)
    return text.strip('-')

# Map product IDs to improved, distinct titles
title_updates = {
    1: "Grand Antique Floral Engraved Silver Bowl Set – 5 Pieces",
    2: "Royal Antique Floral Engraved Silver Bowl Set – 5 Pieces",
    19: "Grand Decorative Silver Pedestal Bowls – Set of 10",
    20: "Artisanal Decorative Silver Pedestal Bowls – Set of 7",
    33: "Classic Designer Silver Pooja Bowl Set with Ornamental Legs – 7 Piece",
    34: "Royal Designer Silver Pooja Bowl Set with Ornamental Legs – 8 Piece",
    110: "Scalloped Floral Silver Pedestal Bowl Set – 5 Pieces",
    116: "Silver Multi-Bowl Pooja Set with Decorative Tray",
    128: "Ornate Silver Decorative Serving Bowls – Set of 4",
    129: "Imperial Silver Decorative Serving Bowls – Set of 5",
    168: "Stainless Steel Pedestal Craft Bowl Set"
}

updated_count = 0
for p in products:
    pid = p['id']
    if pid in title_updates:
        old_title = p['title']
        new_title = title_updates[pid]
        p['title'] = new_title
        p['slug'] = slugify(new_title)
        # Update description if it contains old title
        p['description'] = f"Exquisite handcrafted {new_title} by Sai Balaji Silverworks. Meticulously designed with authentic {p.get('silver_purity', '925 Sterling Silver')} and a protective anti-tarnish luster."
        print(f"Updated Product ID {pid}:\n  Old: '{old_title}'\n  New: '{new_title}'\n")
        updated_count += 1

with open(products_path, 'w', encoding='utf-8') as f:
    json.dump(products, f, indent=2, ensure_ascii=False)

print(f"Successfully updated {updated_count} product names in backend/products_data.json")
