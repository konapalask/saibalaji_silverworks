from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine, Base
from app.core.security import get_password_hash
from app.models.models import (
    User, UserRole, Category, Product, ProductImage, ProductType,
    RetailOrder, RetailOrderItem, OrderStatus,
    WholesaleRequest, WholesaleRequestItem, WholesaleStatus,
    Quotation, QuotationItem, QuotationStatus, CMSContent, CompanyVideo
)

def seed_database():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()

    print("[*] Seeding Sai Balaji Silverworks Database...")

    # 1. Users
    admin_user = User(
        email="admin@saibalajisilverworks.com",
        hashed_password=get_password_hash("admin123"),
        full_name="Sai Balaji Admin",
        phone="+91 98765 00000",
        company_name="Sai Balaji Silverworks Pvt Ltd",
        gstin="36AAAAA0000A1Z5",
        role=UserRole.ADMIN
    )
    nikhil_user = User(
        email="samuelnikhilmddali123@gmail.com",
        hashed_password=get_password_hash("nikhil123"),
        full_name="Samuel Nikhil",
        phone="+91 91212 66269",
        company_name="Sai Balaji Silverworks",
        role=UserRole.CUSTOMER
    )
    db.add(admin_user)
    db.add(nikhil_user)
    db.commit()
    db.refresh(admin_user)
    db.refresh(nikhil_user)

    # 2. 5 Main Categories
    categories_data = [
        {
            "name": "Silver Pooja Articles",
            "slug": "silver-pooja-articles",
            "description": "Sacred 925 sterling & 999 fine silver ritual essentials and puja accessories.",
            "image_url": "/Sai-Balaji-Silverworks-Products/01-Silver-Pooja-Articles/Silver-God-Idols/AMS-115-0054.webp"
        },
        {
            "name": "Silver God & Temple Items",
            "slug": "silver-god-temple-items",
            "description": "Hand-crafted 999 fine silver deities, sanctum adornments, and temple accessories.",
            "image_url": "/Sai-Balaji-Silverworks-Products/02-Silver-God-Temple-Items/Balaji-Idols/download.webp"
        },
        {
            "name": "Silver Dining & Tableware",
            "slug": "silver-dining-tableware",
            "description": "Luxury 925 sterling dinner sets, tumblers, bowls, and royal silverware.",
            "image_url": "/Sai-Balaji-Silverworks-Products/03-Silver-Dining-Tableware/Silver-Dinner-Sets/images.jpg"
        },
        {
            "name": "Silver Baby & Kids Gifts",
            "slug": "silver-baby-kids-gifts",
            "description": "Auspicious pure silver baby feeding articles, anklets, and keepsake gifts.",
            "image_url": "/Sai-Balaji-Silverworks-Products/04-Silver-Baby-Kids-Gifts/Silver-Feeding-Sets/images (1).jpg"
        },
        {
            "name": "Silver Wedding & Return Gifts",
            "slug": "silver-wedding-return-gifts",
            "description": "Memorable silver keepsakes, return gift thalis, and custom wedding tokens.",
            "image_url": "/Sai-Balaji-Silverworks-Products/05-Silver-Wedding-Return-Gifts/Silver-Wedding-Gifts/images (1).jpg"
        }
    ]

    cat_map = {}
    for c in categories_data:
        cat = Category(name=c["name"], slug=c["slug"], description=c["description"], image_url=c["image_url"], is_featured=True)
        db.add(cat)
        db.commit()
        db.refresh(cat)
        cat_map[c["slug"]] = cat.id

    # 3. Products Data across all 5 categories
    products_data = [
        # --- Category 1: Silver Pooja Articles ---
        {
            "title": "Royal Silver Lakshmi Ganesha Idol Set",
            "slug": "royal-silver-lakshmi-ganesha-idol-set",
            "sku": "SBS-PA-001",
            "category_slug": "silver-pooja-articles",
            "subcategory": "Silver God Idols",
            "purity": "999 Fine Silver",
            "weight_g": 180.0,
            "retail_price": 28500.0,
            "wholesale_price": 22000.0,
            "min_wholesale_qty": 5,
            "stock": 35,
            "featured_image": "/Sai-Balaji-Silverworks-Products/01-Silver-Pooja-Articles/Silver-God-Idols/AMS-115-0054.webp",
            "description": "Mastercrafted 999 Fine Silver Lakshmi & Ganesha idol pair, finished with anti-tarnish protective coating.",
            "specifications": "Material: 999 Fine Silver | Weight: 180g | Height: 4.5 inches"
        },
        {
            "title": "Handcrafted Sterling Silver Nakshi Diya",
            "slug": "handcrafted-sterling-silver-nakshi-diya",
            "sku": "SBS-PA-002",
            "category_slug": "silver-pooja-articles",
            "subcategory": "Silver Deepams",
            "purity": "925 Sterling Silver",
            "weight_g": 65.0,
            "retail_price": 9800.0,
            "wholesale_price": 7500.0,
            "min_wholesale_qty": 10,
            "stock": 60,
            "featured_image": "/Sai-Balaji-Silverworks-Products/01-Silver-Pooja-Articles/Silver-Deepams/silver-lamp-silver-article-by-unniyarcha-jewellery-844414_1800x1800.webp",
            "description": "Elaborately engraved 925 sterling silver oil lamp featuring intricate floral Nakshi work.",
            "specifications": "Material: 925 Sterling Silver | Weight: 65g | Diameter: 3.5 inches"
        },
        {
            "title": "Silver Kamatchi Amman Vilakku Deepam",
            "slug": "silver-kamatchi-amman-vilakku-deepam",
            "sku": "SBS-PA-003",
            "category_slug": "silver-pooja-articles",
            "subcategory": "Silver Deepams",
            "purity": "925 Sterling Silver",
            "weight_g": 120.0,
            "retail_price": 16500.0,
            "wholesale_price": 13200.0,
            "min_wholesale_qty": 8,
            "stock": 25,
            "featured_image": "/Sai-Balaji-Silverworks-Products/01-Silver-Pooja-Articles/Silver-Deepams/silver-lamp-silver-article-by-unniyarcha-jewellery-844414_1800x1800.webp",
            "description": "Traditional South Indian Kamatchi Amman oil lamp cast in 925 sterling silver.",
            "specifications": "Material: 925 Sterling Silver | Weight: 120g | Height: 6 inches"
        },
        {
            "title": "Embossed Silver Pooja Thali Plate 10-inch",
            "slug": "embossed-silver-pooja-thali-plate-10-inch",
            "sku": "SBS-PA-004",
            "category_slug": "silver-pooja-articles",
            "subcategory": "Silver Pooja Plates",
            "purity": "925 Sterling Silver",
            "weight_g": 240.0,
            "retail_price": 32000.0,
            "wholesale_price": 26000.0,
            "min_wholesale_qty": 5,
            "stock": 18,
            "featured_image": "/Sai-Balaji-Silverworks-Products/01-Silver-Pooja-Articles/Silver-Pooja-Plates/DSC_7725.webp",
            "description": "Heavy gauge 925 silver ritual thali plate decorated with auspicious lotus borders.",
            "specifications": "Material: 925 Sterling Silver | Weight: 240g | Diameter: 10 inches"
        },
        {
            "title": "Pure Silver Peacock Kumkum Bharani Box",
            "slug": "pure-silver-peacock-kumkum-bharani-box",
            "sku": "SBS-PA-005",
            "category_slug": "silver-pooja-articles",
            "subcategory": "Silver Kumkum Bharani",
            "purity": "925 Sterling Silver",
            "weight_g": 35.0,
            "retail_price": 4800.0,
            "wholesale_price": 3600.0,
            "min_wholesale_qty": 15,
            "stock": 40,
            "featured_image": "/Sai-Balaji-Silverworks-Products/01-Silver-Pooja-Articles/Silver-Kumkum-Bharani/silver-peacock-lamp-silver-article-by-unniyarcha-jewellery-732650_1800x1800.jpg",
            "description": "Intricately sculpted peacock-topped silver container for sacred vermilion.",
            "specifications": "Material: 925 Sterling Silver | Weight: 35g"
        },
        {
            "title": "Clear-Sounding Silver Hand Temple Bell",
            "slug": "clear-sounding-silver-hand-temple-bell",
            "sku": "SBS-PA-006",
            "category_slug": "silver-pooja-articles",
            "subcategory": "Silver Bell",
            "purity": "925 Sterling Silver",
            "weight_g": 85.0,
            "retail_price": 11500.0,
            "wholesale_price": 8900.0,
            "min_wholesale_qty": 10,
            "stock": 30,
            "featured_image": "/Sai-Balaji-Silverworks-Products/01-Silver-Pooja-Articles/Silver-Bell/31Yu3JtG3YL._SY300_SX300_QL70_FMwebp_.webp",
            "description": "Solid silver pooja bell with Nandi finial, engineered for resonant acoustic purity.",
            "specifications": "Material: 925 Sterling Silver | Weight: 85g | Sound: Resonant High Octave"
        },
        {
            "title": "Traditional Silver Kalash Lota",
            "slug": "traditional-silver-kalash-lota",
            "sku": "SBS-PA-007",
            "category_slug": "silver-pooja-articles",
            "subcategory": "Silver Kalash",
            "purity": "999 Fine Silver",
            "weight_g": 150.0,
            "retail_price": 22500.0,
            "wholesale_price": 18500.0,
            "min_wholesale_qty": 6,
            "stock": 20,
            "featured_image": "/Sai-Balaji-Silverworks-Products/01-Silver-Pooja-Articles/Silver-Kalash/shopping.webp",
            "description": "Seamless 999 fine silver holy water vessel for Abhishek and Griha Pravesh rituals.",
            "specifications": "Material: 999 Fine Silver | Weight: 150g"
        },
        {
            "title": "Silver Panchapatra & Uddharini Set",
            "slug": "silver-panchapatra-uddharini-set",
            "sku": "SBS-PA-008",
            "category_slug": "silver-pooja-articles",
            "subcategory": "Silver Panchapatra & Uddharini",
            "purity": "925 Sterling Silver",
            "weight_g": 70.0,
            "retail_price": 9500.0,
            "wholesale_price": 7600.0,
            "min_wholesale_qty": 12,
            "stock": 45,
            "featured_image": "/Sai-Balaji-Silverworks-Products/01-Silver-Pooja-Articles/Silver-Panchapatra-Uddharini/shopping (1).webp",
            "description": "Engraved ritual holy water cup and spoon set for Sandhyavandanam rituals.",
            "specifications": "Material: 925 Sterling Silver | Weight: 70g"
        },
        {
            "title": "Dual Compartment Silver Akshinthalu Container",
            "slug": "dual-compartment-silver-akshinthalu-container",
            "sku": "SBS-PA-009",
            "category_slug": "silver-pooja-articles",
            "subcategory": "Silver Akshinthalu Containers",
            "purity": "925 Sterling Silver",
            "weight_g": 45.0,
            "retail_price": 6200.0,
            "wholesale_price": 4900.0,
            "min_wholesale_qty": 15,
            "stock": 30,
            "featured_image": "/Sai-Balaji-Silverworks-Products/01-Silver-Pooja-Articles/Silver-Akshinthalu-Containers/shopping.webp",
            "description": "Twin silver bowl set for blessing rice (Akshinthalu) and turmeric.",
            "specifications": "Material: 925 Sterling Silver | Weight: 45g"
        },
        {
            "title": "Complete 7-Piece Silver Pooja Samagri Gift Set",
            "slug": "complete-7-piece-silver-pooja-samagri-gift-set",
            "sku": "SBS-PA-010",
            "category_slug": "silver-pooja-articles",
            "subcategory": "Silver Pooja Sets",
            "purity": "925 Sterling Silver",
            "weight_g": 380.0,
            "retail_price": 49500.0,
            "wholesale_price": 39500.0,
            "min_wholesale_qty": 3,
            "stock": 12,
            "featured_image": "/Sai-Balaji-Silverworks-Products/01-Silver-Pooja-Articles/Silver-Pooja-Sets/shopping (1).webp",
            "description": "Grand thali set including thali plate, diya, bell, kalash, kumkum box, agarbatti stand, and spoon.",
            "specifications": "Material: 925 Sterling Silver | Weight: 380g | 7 Pieces"
        },

        # --- Category 2: Silver God & Temple Items ---
        {
            "title": "Tirupati Lord Balaji Venkateswara Idol",
            "slug": "tirupati-lord-balaji-venkateswara-idol",
            "sku": "SBS-GT-001",
            "category_slug": "silver-god-temple-items",
            "subcategory": "Balaji Idol",
            "purity": "999 Fine Silver",
            "weight_g": 220.0,
            "retail_price": 34000.0,
            "wholesale_price": 27500.0,
            "min_wholesale_qty": 4,
            "stock": 15,
            "featured_image": "/Sai-Balaji-Silverworks-Products/02-Silver-God-Temple-Items/Balaji-Idols/download.webp",
            "description": "Solid 999 fine silver Lord Venkateswara idol sculpted with authentic Tirumala Alankaram details.",
            "specifications": "Material: 999 Fine Silver | Weight: 220g | Height: 5.5 inches"
        },
        {
            "title": "Goddess Ashta Lakshmi Silver Idol",
            "slug": "goddess-ashta-lakshmi-silver-idol",
            "sku": "SBS-GT-002",
            "category_slug": "silver-god-temple-items",
            "subcategory": "Lakshmi Devi Idol",
            "purity": "999 Fine Silver",
            "weight_g": 160.0,
            "retail_price": 25000.0,
            "wholesale_price": 19800.0,
            "min_wholesale_qty": 5,
            "stock": 20,
            "featured_image": "/Sai-Balaji-Silverworks-Products/02-Silver-God-Temple-Items/Lakshmi-Devi-Idols/download.webp",
            "description": "Seated Lakshmi Devi idol casting gold-accented lotus base in pure 999 silver.",
            "specifications": "Material: 999 Fine Silver | Weight: 160g | Height: 4.5 inches"
        },
        {
            "title": "Blessing Lord Ganesha Silver Statue",
            "slug": "blessing-lord-ganesha-silver-statue",
            "sku": "SBS-GT-003",
            "category_slug": "silver-god-temple-items",
            "subcategory": "Ganesh Idol",
            "purity": "999 Fine Silver",
            "weight_g": 110.0,
            "retail_price": 17200.0,
            "wholesale_price": 13900.0,
            "min_wholesale_qty": 8,
            "stock": 35,
            "featured_image": "/Sai-Balaji-Silverworks-Products/02-Silver-God-Temple-Items/Ganesh-Idols/download (1).webp",
            "description": "Divine Abhaya Hasta Ganesha silver idol for office desk, home altar, or car dashboard.",
            "specifications": "Material: 999 Fine Silver | Weight: 110g"
        },
        {
            "title": "Shirdi Sai Baba Seated Silver Murti",
            "slug": "shirdi-sai-baba-seated-silver-murti",
            "sku": "SBS-GT-004",
            "category_slug": "silver-god-temple-items",
            "subcategory": "Sai Baba Idol",
            "purity": "999 Fine Silver",
            "weight_g": 140.0,
            "retail_price": 21000.0,
            "wholesale_price": 16800.0,
            "min_wholesale_qty": 6,
            "stock": 18,
            "featured_image": "/Sai-Balaji-Silverworks-Products/02-Silver-God-Temple-Items/Sai-Baba-Idols/download (1).webp",
            "description": "Revered seated Shirdi Sai Baba murti crafted in solid pure silver.",
            "specifications": "Material: 999 Fine Silver | Weight: 140g"
        },
        {
            "title": "Venugopala Radhe Krishna Silver Idol",
            "slug": "venugopala-radhe-krishna-silver-idol",
            "sku": "SBS-GT-005",
            "category_slug": "silver-god-temple-items",
            "subcategory": "Krishna Idol",
            "purity": "999 Fine Silver",
            "weight_g": 190.0,
            "retail_price": 29800.0,
            "wholesale_price": 23500.0,
            "min_wholesale_qty": 5,
            "stock": 14,
            "featured_image": "/Sai-Balaji-Silverworks-Products/02-Silver-God-Temple-Items/Krishna-Idols/download (1).webp",
            "description": "Lord Krishna with flute sculpted alongside sacred Kamadhenu cow in pure silver.",
            "specifications": "Material: 999 Fine Silver | Weight: 190g"
        },
        {
            "title": "Lord Shiva Meditating Lingam Murti",
            "slug": "lord-shiva-meditating-lingam-murti",
            "sku": "SBS-GT-006",
            "category_slug": "silver-god-temple-items",
            "subcategory": "Shiva Idol",
            "purity": "999 Fine Silver",
            "weight_g": 130.0,
            "retail_price": 19500.0,
            "wholesale_price": 15600.0,
            "min_wholesale_qty": 6,
            "stock": 22,
            "featured_image": "/Sai-Balaji-Silverworks-Products/02-Silver-God-Temple-Items/Shiva-Idols/images.jpg",
            "description": "Lord Shiva in deep Dhyana mudra with 999 silver Shivling and Trishul.",
            "specifications": "Material: 999 Fine Silver | Weight: 130g"
        },
        {
            "title": "Veera Anjaneya Lord Hanuman Idol",
            "slug": "veera-anjaneya-lord-hanuman-idol",
            "sku": "SBS-GT-007",
            "category_slug": "silver-god-temple-items",
            "subcategory": "Hanuman Idol",
            "purity": "999 Fine Silver",
            "weight_g": 155.0,
            "retail_price": 23800.0,
            "wholesale_price": 18900.0,
            "min_wholesale_qty": 5,
            "stock": 16,
            "featured_image": "/Sai-Balaji-Silverworks-Products/02-Silver-God-Temple-Items/Hanuman-Idols/download.webp",
            "description": "Strong Sanjeevani-holding Hanuman idol in solid anti-tarnish pure silver.",
            "specifications": "Material: 999 Fine Silver | Weight: 155g"
        },
        {
            "title": "Goddess Durga Devi & Saraswati Idols",
            "slug": "goddess-durga-devi-saraswati-idols",
            "sku": "SBS-GT-008",
            "category_slug": "silver-god-temple-items",
            "subcategory": "Goddess Idols",
            "purity": "999 Fine Silver",
            "weight_g": 175.0,
            "retail_price": 27000.0,
            "wholesale_price": 21500.0,
            "min_wholesale_qty": 4,
            "stock": 10,
            "featured_image": "/Sai-Balaji-Silverworks-Products/02-Silver-God-Temple-Items/Goddess-Idols/images.jpg",
            "description": "Divine Goddess Saraswati with Veena in 999 silver.",
            "specifications": "Material: 999 Fine Silver | Weight: 175g"
        },
        {
            "title": "Pure Silver Temple Crown Kireetam Accessory",
            "slug": "pure-silver-temple-crown-kireetam-accessory",
            "sku": "SBS-GT-009",
            "category_slug": "silver-god-temple-items",
            "subcategory": "Silver Temple Accessories",
            "purity": "999 Fine Silver",
            "weight_g": 310.0,
            "retail_price": 45000.0,
            "wholesale_price": 36000.0,
            "min_wholesale_qty": 2,
            "stock": 8,
            "featured_image": "/Sai-Balaji-Silverworks-Products/02-Silver-God-Temple-Items/Silver-Temple-Accessories/img-64897881367e29b08794235.46763001.jpg",
            "description": "Traditional 999 silver deity crown (Kireetam) for sanctum idols.",
            "specifications": "Material: 999 Fine Silver | Weight: 310g"
        },

        # --- Category 3: Silver Dining & Tableware ---
        {
            "title": "Royal 5-Piece Silver Dinner Thali Set",
            "slug": "royal-5-piece-silver-dinner-thali-set",
            "sku": "SBS-DT-001",
            "category_slug": "silver-dining-tableware",
            "subcategory": "Silver Dinner Sets",
            "purity": "925 Sterling Silver",
            "weight_g": 450.0,
            "retail_price": 58000.0,
            "wholesale_price": 46500.0,
            "min_wholesale_qty": 2,
            "stock": 12,
            "featured_image": "/Sai-Balaji-Silverworks-Products/03-Silver-Dining-Tableware/Silver-Dinner-Sets/images.jpg",
            "description": "Luxurious 5-piece 925 sterling silver dining set including 11-inch plate, 2 bowls, tumbler, and spoon.",
            "specifications": "Material: 925 Sterling Silver | Weight: 450g | 5 Pieces"
        },
        {
            "title": "Embossed Silver Dining Plate 11-inch",
            "slug": "embossed-silver-dining-plate-11-inch",
            "sku": "SBS-DT-002",
            "category_slug": "silver-dining-tableware",
            "subcategory": "Silver Plates",
            "purity": "925 Sterling Silver",
            "weight_g": 260.0,
            "retail_price": 34500.0,
            "wholesale_price": 27800.0,
            "min_wholesale_qty": 4,
            "stock": 25,
            "featured_image": "/Sai-Balaji-Silverworks-Products/03-Silver-Dining-Tableware/Silver-Plates/images.jpg",
            "description": "Pure silver dining plate with beaded rim detailing.",
            "specifications": "Material: 925 Sterling Silver | Weight: 260g"
        },
        {
            "title": "Floral Nakshi Silver Katori Bowl",
            "slug": "floral-nakshi-silver-katori-bowl",
            "sku": "SBS-DT-003",
            "category_slug": "silver-dining-tableware",
            "subcategory": "Silver Bowls",
            "purity": "925 Sterling Silver",
            "weight_g": 55.0,
            "retail_price": 7500.0,
            "wholesale_price": 5900.0,
            "min_wholesale_qty": 10,
            "stock": 50,
            "featured_image": "/Sai-Balaji-Silverworks-Products/03-Silver-Dining-Tableware/Silver-Bowls/images (1).jpg",
            "description": "Single heavy silver serving bowl for sweet dishes, curries, and payasam.",
            "specifications": "Material: 925 Sterling Silver | Weight: 55g"
        },
        {
            "title": "Heavyweight Silver Drinking Tumbler Glass",
            "slug": "heavyweight-silver-drinking-tumbler-glass",
            "sku": "SBS-DT-004",
            "category_slug": "silver-dining-tableware",
            "subcategory": "Silver Tumblers",
            "purity": "925 Sterling Silver",
            "weight_g": 90.0,
            "retail_price": 12200.0,
            "wholesale_price": 9700.0,
            "min_wholesale_qty": 8,
            "stock": 40,
            "featured_image": "/Sai-Balaji-Silverworks-Products/03-Silver-Dining-Tableware/Silver-Tumblers/images.jpg",
            "description": "Ergonomic silver glass tumbler for water and milk.",
            "specifications": "Material: 925 Sterling Silver | Weight: 90g | Capacity: 250ml"
        },
        {
            "title": "Traditional Silver Water Glass Cup",
            "slug": "traditional-silver-water-glass-cup",
            "sku": "SBS-DT-005",
            "category_slug": "silver-dining-tableware",
            "subcategory": "Silver Glasses",
            "purity": "925 Sterling Silver",
            "weight_g": 85.0,
            "retail_price": 11500.0,
            "wholesale_price": 9200.0,
            "min_wholesale_qty": 8,
            "stock": 35,
            "featured_image": "/Sai-Balaji-Silverworks-Products/03-Silver-Dining-Tableware/Silver-Glasses/images.jpg",
            "description": "Handcrafted pure silver drinking glass tumbler.",
            "specifications": "Material: 925 Sterling Silver | Weight: 85g"
        },
        {
            "title": "Handcrafted Sterling Silver Dessert Spoons (Set of 2)",
            "slug": "handcrafted-sterling-silver-dessert-spoons-set-of-2",
            "sku": "SBS-DT-006",
            "category_slug": "silver-dining-tableware",
            "subcategory": "Silver Spoons",
            "purity": "925 Sterling Silver",
            "weight_g": 40.0,
            "retail_price": 5400.0,
            "wholesale_price": 4200.0,
            "min_wholesale_qty": 12,
            "stock": 60,
            "featured_image": "/Sai-Balaji-Silverworks-Products/03-Silver-Dining-Tableware/Silver-Spoons/images (1).jpg",
            "description": "Pair of mirror-finish silver dessert spoons with lotus engraved handles.",
            "specifications": "Material: 925 Sterling Silver | Weight: 40g (Pair)"
        },
        {
            "title": "Pure Silver Coffee & Tea Cup",
            "slug": "pure-silver-coffee-tea-cup",
            "sku": "SBS-DT-007",
            "category_slug": "silver-dining-tableware",
            "subcategory": "Silver Cups",
            "purity": "925 Sterling Silver",
            "weight_g": 65.0,
            "retail_price": 8900.0,
            "wholesale_price": 7100.0,
            "min_wholesale_qty": 10,
            "stock": 30,
            "featured_image": "/Sai-Balaji-Silverworks-Products/03-Silver-Dining-Tableware/Silver-Cups/images (1).jpg",
            "description": "Royal silver cup and saucer set for traditional beverages.",
            "specifications": "Material: 925 Sterling Silver | Weight: 65g"
        },
        {
            "title": "Royal Silver Serving Dish Bowl & Spoon Set",
            "slug": "royal-silver-serving-dish-bowl-spoon-set",
            "sku": "SBS-DT-008",
            "category_slug": "silver-dining-tableware",
            "subcategory": "Silver Serving Sets",
            "purity": "925 Sterling Silver",
            "weight_g": 320.0,
            "retail_price": 41000.0,
            "wholesale_price": 32500.0,
            "min_wholesale_qty": 3,
            "stock": 10,
            "featured_image": "/Sai-Balaji-Silverworks-Products/03-Silver-Dining-Tableware/Silver-Serving-Sets/images (1).jpg",
            "description": "Grand silver serving bowl set with lid and matching serving ladle.",
            "specifications": "Material: 925 Sterling Silver | Weight: 320g"
        },

        # --- Category 4: Silver Baby & Kids Gifts ---
        {
            "title": "Silver Baby Feeding Bottle & Glass Set",
            "slug": "silver-baby-feeding-bottle-glass-set",
            "sku": "SBS-BK-001",
            "category_slug": "silver-baby-kids-gifts",
            "subcategory": "Silver Feeding Set",
            "purity": "925 Sterling Silver",
            "weight_g": 80.0,
            "retail_price": 11000.0,
            "wholesale_price": 8700.0,
            "min_wholesale_qty": 8,
            "stock": 30,
            "featured_image": "/Sai-Balaji-Silverworks-Products/04-Silver-Baby-Kids-Gifts/Silver-Feeding-Sets/images (1).jpg",
            "description": "Antimicrobial 925 silver baby glass and spoon set for Anna Prasanam ceremony.",
            "specifications": "Material: 925 Sterling Silver | Weight: 80g"
        },
        {
            "title": "Soft Silver Baby Feeding Spoon",
            "slug": "soft-silver-baby-feeding-spoon",
            "sku": "SBS-BK-002",
            "category_slug": "silver-baby-kids-gifts",
            "subcategory": "Silver Baby Spoon",
            "purity": "925 Sterling Silver",
            "weight_g": 18.0,
            "retail_price": 2500.0,
            "wholesale_price": 1900.0,
            "min_wholesale_qty": 20,
            "stock": 70,
            "featured_image": "/Sai-Balaji-Silverworks-Products/04-Silver-Baby-Kids-Gifts/Silver-Baby-Spoons/images.jpg",
            "description": "Smooth rounded-edge silver feeding spoon for infants.",
            "specifications": "Material: 925 Sterling Silver | Weight: 18g"
        },
        {
            "title": "Silver Baby Ghungroo Payal Anklets Pair",
            "slug": "silver-baby-ghungroo-payal-anklets-pair",
            "sku": "SBS-BK-003",
            "category_slug": "silver-baby-kids-gifts",
            "subcategory": "Silver Anklets",
            "purity": "925 Sterling Silver",
            "weight_g": 25.0,
            "retail_price": 3600.0,
            "wholesale_price": 2800.0,
            "min_wholesale_qty": 15,
            "stock": 50,
            "featured_image": "/Sai-Balaji-Silverworks-Products/04-Silver-Baby-Kids-Gifts/Silver-Anklets/images.jpg",
            "description": "Adjustable silver anklets with sweet jingling bells for babies.",
            "specifications": "Material: 925 Sterling Silver | Weight: 25g Pair"
        },
        {
            "title": "Complete Silver Baby Gift Box Set",
            "slug": "complete-silver-baby-gift-box-set",
            "sku": "SBS-BK-004",
            "category_slug": "silver-baby-kids-gifts",
            "subcategory": "Silver Baby Gift Sets",
            "purity": "925 Sterling Silver",
            "weight_g": 120.0,
            "retail_price": 16500.0,
            "wholesale_price": 13200.0,
            "min_wholesale_qty": 5,
            "stock": 20,
            "featured_image": "/Sai-Balaji-Silverworks-Products/04-Silver-Baby-Kids-Gifts/Silver-Baby-Gift-Sets/images.jpg",
            "description": "Luxury gift box with baby glass, bowl, spoon, and anklets.",
            "specifications": "Material: 925 Sterling Silver | Weight: 120g"
        },
        {
            "title": "Silver Infant Palada Feeding Bowl",
            "slug": "silver-infant-palada-feeding-bowl",
            "sku": "SBS-BK-005",
            "category_slug": "silver-baby-kids-gifts",
            "subcategory": "Silver Baby Bowl",
            "purity": "925 Sterling Silver",
            "weight_g": 35.0,
            "retail_price": 4900.0,
            "wholesale_price": 3800.0,
            "min_wholesale_qty": 12,
            "stock": 40,
            "featured_image": "/Sai-Balaji-Silverworks-Products/04-Silver-Baby-Kids-Gifts/Silver-Baby-Bowls/images.jpg",
            "description": "Pure silver Palada feeding cup for newborns.",
            "specifications": "Material: 925 Sterling Silver | Weight: 35g"
        },
        {
            "title": "Pure Silver Juli Baby Drinking Glasses (Pack of 4)",
            "slug": "pure-silver-juli-baby-drinking-glasses-pack-of-4",
            "sku": "SBS-BK-006",
            "category_slug": "silver-baby-kids-gifts",
            "subcategory": "Silver Baby Glass",
            "purity": "925 Sterling Silver",
            "weight_g": 95.0,
            "retail_price": 13200.0,
            "wholesale_price": 10500.0,
            "min_wholesale_qty": 5,
            "stock": 25,
            "featured_image": "/Sai-Balaji-Silverworks-Products/04-Silver-Baby-Kids-Gifts/Silver-Baby-Glasses/Pure-Silver-Juli-Glasses-Pack-of-4.jpg",
            "description": "Set of 4 small silver drinking tumblers for toddlers.",
            "specifications": "Material: 925 Sterling Silver | Weight: 95g Total"
        },
        {
            "title": "Silver Nazariya Black Bead Baby Bracelet Pair",
            "slug": "silver-nazariya-black-bead-baby-bracelet-pair",
            "sku": "SBS-BK-007",
            "category_slug": "silver-baby-kids-gifts",
            "subcategory": "Silver Bracelets",
            "purity": "925 Sterling Silver",
            "weight_g": 15.0,
            "retail_price": 2200.0,
            "wholesale_price": 1650.0,
            "min_wholesale_qty": 20,
            "stock": 60,
            "featured_image": "/Sai-Balaji-Silverworks-Products/04-Silver-Baby-Kids-Gifts/Silver-Bracelets/images (1).jpg",
            "description": "Protective black bead Nazariya silver bracelets for babies.",
            "specifications": "Material: 925 Sterling Silver | Weight: 15g Pair"
        },

        # --- Category 5: Silver Wedding & Return Gifts ---
        {
            "title": "Silver Wedding Couple Gift Thali & Diya Set",
            "slug": "silver-wedding-couple-gift-thali-diya-set",
            "sku": "SBS-WG-001",
            "category_slug": "silver-wedding-return-gifts",
            "subcategory": "Silver Wedding Gifts",
            "purity": "925 Sterling Silver",
            "weight_g": 140.0,
            "retail_price": 19000.0,
            "wholesale_price": 14900.0,
            "min_wholesale_qty": 5,
            "stock": 30,
            "featured_image": "/Sai-Balaji-Silverworks-Products/05-Silver-Wedding-Return-Gifts/Silver-Wedding-Gifts/images (1).jpg",
            "description": "Auspicious wedding gift set featuring carved silver thali and twin diyas in velvet box.",
            "specifications": "Material: 925 Sterling Silver | Weight: 140g"
        },
        {
            "title": "Bulk Silver Return Gift Kumkum Container (Pack of 10)",
            "slug": "bulk-silver-return-gift-kumkum-container-pack-of-10",
            "sku": "SBS-WG-002",
            "category_slug": "silver-wedding-return-gifts",
            "subcategory": "Silver Return Gifts",
            "purity": "925 Sterling Silver",
            "weight_g": 150.0,
            "retail_price": 19500.0,
            "wholesale_price": 15000.0,
            "min_wholesale_qty": 3,
            "stock": 40,
            "featured_image": "/Sai-Balaji-Silverworks-Products/05-Silver-Wedding-Return-Gifts/Silver-Return-Gifts/images.jpg",
            "description": "Wholesale pack of 10 silver kumkum boxes for marriage return gifts.",
            "specifications": "Material: 925 Sterling Silver | Weight: 15g each (150g total)"
        },
        {
            "title": "Silver Wedding Couple Lakshmi Coin 10g",
            "slug": "silver-wedding-couple-lakshmi-coin-10g",
            "sku": "SBS-WG-003",
            "category_slug": "silver-wedding-return-gifts",
            "subcategory": "Silver Gift Coins",
            "purity": "999 Fine Silver",
            "weight_g": 10.0,
            "retail_price": 1500.0,
            "wholesale_price": 1150.0,
            "min_wholesale_qty": 25,
            "stock": 200,
            "featured_image": "/Sai-Balaji-Silverworks-Products/05-Silver-Wedding-Return-Gifts/Silver-Gift-Coins/download.jpg",
            "description": "999 Fine Silver wedding coin packaged in acrylic blister card.",
            "specifications": "Material: 999 Fine Silver | Weight: 10g"
        },
        {
            "title": "Customized Engraved Silver Wedding Token",
            "slug": "customized-engraved-silver-wedding-token",
            "sku": "SBS-WG-004",
            "category_slug": "silver-wedding-return-gifts",
            "subcategory": "Customized Wedding Gifts",
            "purity": "999 Fine Silver",
            "weight_g": 50.0,
            "retail_price": 7200.0,
            "wholesale_price": 5700.0,
            "min_wholesale_qty": 10,
            "stock": 50,
            "featured_image": "/Sai-Balaji-Silverworks-Products/05-Silver-Wedding-Return-Gifts/Customized-Wedding-Gifts/images (1).jpg",
            "description": "Laser-engraved silver wedding souvenir framed token.",
            "specifications": "Material: 999 Fine Silver | Weight: 50g"
        },
        {
            "title": "Silver Radha Krishna Couple Wedding Gift Idol",
            "slug": "silver-radha-krishna-couple-wedding-gift-idol",
            "sku": "SBS-WG-005",
            "category_slug": "silver-wedding-return-gifts",
            "subcategory": "Silver Couple Gifts",
            "purity": "999 Fine Silver",
            "weight_g": 110.0,
            "retail_price": 16800.0,
            "wholesale_price": 13500.0,
            "min_wholesale_qty": 5,
            "stock": 25,
            "featured_image": "/Sai-Balaji-Silverworks-Products/05-Silver-Wedding-Return-Gifts/Silver-Couple-Gifts/download.jpg",
            "description": "Revered divine couple idol gift for newlyweds.",
            "specifications": "Material: 999 Fine Silver | Weight: 110g"
        },
        {
            "title": "Carved Silver Wedding Oil Lamp Diya Pair",
            "slug": "carved-silver-wedding-oil-lamp-diya-pair",
            "sku": "SBS-WG-006",
            "category_slug": "silver-wedding-return-gifts",
            "subcategory": "Silver Diyas",
            "purity": "925 Sterling Silver",
            "weight_g": 90.0,
            "retail_price": 12800.0,
            "wholesale_price": 10200.0,
            "min_wholesale_qty": 8,
            "stock": 35,
            "featured_image": "/Sai-Balaji-Silverworks-Products/05-Silver-Wedding-Return-Gifts/Silver-Diyas/DSC5197_2.webp",
            "description": "Pair of carved silver oil lamps for auspicious housewarming and wedding gifts.",
            "specifications": "Material: 925 Sterling Silver | Weight: 90g Pair"
        },
        {
            "title": "Royal Silver Wedding Presentation Gift Set",
            "slug": "royal-silver-wedding-presentation-gift-set",
            "sku": "SBS-WG-007",
            "category_slug": "silver-wedding-return-gifts",
            "subcategory": "Silver Gift Sets",
            "purity": "925 Sterling Silver",
            "weight_g": 210.0,
            "retail_price": 28000.0,
            "wholesale_price": 22500.0,
            "min_wholesale_qty": 4,
            "stock": 15,
            "featured_image": "/Sai-Balaji-Silverworks-Products/05-Silver-Wedding-Return-Gifts/Silver-Gift-Sets/images.jpg",
            "description": "Complete wedding gift box housing silver bowl, silver coin, and twin kumkum containers.",
            "specifications": "Material: 925 Sterling Silver | Weight: 210g"
        },
        {
            "title": "Pure Silver Ornamental Kumkum Box",
            "slug": "pure-silver-ornamental-kumkum-box",
            "sku": "SBS-WG-008",
            "category_slug": "silver-wedding-return-gifts",
            "subcategory": "Silver Kumkum Boxes",
            "purity": "925 Sterling Silver",
            "weight_g": 25.0,
            "retail_price": 3500.0,
            "wholesale_price": 2700.0,
            "min_wholesale_qty": 15,
            "stock": 60,
            "featured_image": "/Sai-Balaji-Silverworks-Products/05-Silver-Wedding-Return-Gifts/Silver-Kumkum-Boxes/images.jpg",
            "description": "Handcrafted single silver sindoor kumkum box for return gifting.",
            "specifications": "Material: 925 Sterling Silver | Weight: 25g"
        }
    ]

    for p_data in products_data:
        cat_id = cat_map[p_data["category_slug"]]
        prod = Product(
            title=p_data["title"],
            slug=p_data["slug"],
            sku=p_data["sku"],
            category_id=cat_id,
            subcategory=p_data["subcategory"],
            silver_purity=p_data["purity"],
            weight_g=p_data["weight_g"],
            retail_price=p_data["retail_price"],
            wholesale_price=p_data["wholesale_price"],
            min_wholesale_qty=p_data["min_wholesale_qty"],
            stock=p_data["stock"],
            product_type=ProductType.BOTH,
            featured_image=p_data["featured_image"],
            description=p_data["description"],
            specifications=p_data["specifications"],
            is_featured=True,
            is_new_arrival=True,
            is_active=True
        )
        db.add(prod)
        db.commit()
        db.refresh(prod)

        # Add additional image
        img = ProductImage(
            product_id=prod.id,
            image_url=p_data["featured_image"],
            display_order=1
        )
        db.add(img)

    db.commit()

    # 4. Company Videos
    videos = [
        CompanyVideo(
            title="The Story Behind the Silver",
            description="Discover the heritage, passion, and engineering precision that built Sai Balaji Silverworks.",
            video_url="https://assets.mixkit.co/videos/preview/mixkit-artisan-crafting-a-piece-of-jewelry-41586-large.mp4",
            thumbnail_url="https://images.unsplash.com/photo-1600003014755-ba31aa59c4b6?auto=format&fit=crop&w=1200&q=80",
            section="story",
            sort_order=1
        ),
        CompanyVideo(
            title="Inside Our Manufacturing Unit",
            description="Step inside our high-precision casting and silver processing unit in Hyderabad.",
            video_url="https://assets.mixkit.co/videos/preview/mixkit-goldsmith-working-in-his-workshop-41584-large.mp4",
            thumbnail_url="https://images.unsplash.com/photo-1608755728617-aefab37d2edd?auto=format&fit=crop&w=1200&q=80",
            section="manufacturing",
            sort_order=2
        )
    ]
    for v in videos:
        db.add(v)

    db.commit()
    db.close()
    print("[+] Sai Balaji Silverworks Database successfully seeded with 5 main categories and subcategory products!")

if __name__ == "__main__":
    seed_database()
