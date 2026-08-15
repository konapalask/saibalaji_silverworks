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
        role=UserRole.SUPER_ADMIN
    )
    customer_user = User(
        email="customer@gmail.com",
        hashed_password=get_password_hash("customer123"),
        full_name="Ananya Sharma",
        phone="+91 98123 45678",
        company_name="Sharma Jewellers & Retail",
        gstin="36ABCDE1234F1Z9",
        role=UserRole.CUSTOMER
    )
    db.add(admin_user)
    db.add(customer_user)
    db.commit()
    db.refresh(admin_user)
    db.refresh(customer_user)

    # 2. 10 Main Categories
    categories_data = [
        {
            "name": "Silver Pooja Articles",
            "slug": "silver-pooja-articles",
            "description": "Sacred 925 sterling & 999 fine silver ritual essentials and puja accessories.",
            "image_url": "https://images.unsplash.com/photo-1616038242814-a6eac7f46688?auto=format&fit=crop&w=800&q=80"
        },
        {
            "name": "Silver God & Temple Items",
            "slug": "silver-god-temple-items",
            "description": "Hand-crafted 999 fine silver deities, sanctum adornments, and temple accessories.",
            "image_url": "https://images.unsplash.com/photo-1608755728617-aefab37d2edd?auto=format&fit=crop&w=800&q=80"
        },
        {
            "name": "Silver Dining & Tableware",
            "slug": "silver-dining-tableware",
            "description": "Luxury 925 sterling dinner sets, tumblers, bowls, and royal silverware.",
            "image_url": "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80"
        },
        {
            "name": "Silver Baby & Kids Gifts",
            "slug": "silver-baby-kids-gifts",
            "description": "Auspicious pure silver baby feeding articles, anklets, and keepsake gifts.",
            "image_url": "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=800&q=80"
        },
        {
            "name": "Silver Wedding & Return Gifts",
            "slug": "silver-wedding-return-gifts",
            "description": "Memorable silver keepsakes, return gift thalis, and custom wedding tokens.",
            "image_url": "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80"
        },
        {
            "name": "Silver Jewellery",
            "slug": "silver-jewellery",
            "description": "Contemporary & traditional 925 sterling silver necklaces, bangles, and rings.",
            "image_url": "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80"
        },
        {
            "name": "Silver Coins & Bars",
            "slug": "silver-coins-bars",
            "description": "NABL certified 999 pure silver coins, investment bars, and embossed ingots.",
            "image_url": "https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&w=800&q=80"
        },
        {
            "name": "Silver Home Décor",
            "slug": "silver-home-decor",
            "description": "Opulent silver urlis, floral bowls, showpieces, and framed artifacts.",
            "image_url": "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80"
        },
        {
            "name": "Silver Corporate & Premium Gifts",
            "slug": "silver-corporate-premium-gifts",
            "description": "Executive silver mementos, engraved trophies, and custom corporate tokens.",
            "image_url": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80"
        },
        {
            "name": "Customized Silver Products",
            "slug": "customized-silver-products",
            "description": "Bespoke silver casting, laser engraving, photo minting, and custom idols.",
            "image_url": "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80"
        }
    ]

    cat_map = {}
    for c in categories_data:
        cat = Category(name=c["name"], slug=c["slug"], description=c["description"], image_url=c["image_url"], is_featured=True)
        db.add(cat)
        db.commit()
        db.refresh(cat)
        cat_map[c["slug"]] = cat.id

    # 3. Products Data across all 10 categories
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
            "featured_image": "https://images.unsplash.com/photo-1608755728617-aefab37d2edd?auto=format&fit=crop&w=800&q=80",
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
            "featured_image": "https://images.unsplash.com/photo-1616038242814-a6eac7f46688?auto=format&fit=crop&w=800&q=80",
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
            "featured_image": "https://images.unsplash.com/photo-1616038242814-a6eac7f46688?auto=format&fit=crop&w=800&q=80",
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
            "featured_image": "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80",
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
            "featured_image": "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80",
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
            "featured_image": "https://images.unsplash.com/photo-1600003014755-ba31aa59c4b6?auto=format&fit=crop&w=800&q=80",
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
            "featured_image": "https://images.unsplash.com/photo-1616038242814-a6eac7f46688?auto=format&fit=crop&w=800&q=80",
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
            "featured_image": "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80",
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
            "featured_image": "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80",
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
            "featured_image": "https://images.unsplash.com/photo-1616038242814-a6eac7f46688?auto=format&fit=crop&w=800&q=80",
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
            "featured_image": "https://images.unsplash.com/photo-1608755728617-aefab37d2edd?auto=format&fit=crop&w=800&q=80",
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
            "featured_image": "https://images.unsplash.com/photo-1608755728617-aefab37d2edd?auto=format&fit=crop&w=800&q=80",
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
            "featured_image": "https://images.unsplash.com/photo-1608755728617-aefab37d2edd?auto=format&fit=crop&w=800&q=80",
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
            "featured_image": "https://images.unsplash.com/photo-1608755728617-aefab37d2edd?auto=format&fit=crop&w=800&q=80",
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
            "featured_image": "https://images.unsplash.com/photo-1608755728617-aefab37d2edd?auto=format&fit=crop&w=800&q=80",
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
            "featured_image": "https://images.unsplash.com/photo-1608755728617-aefab37d2edd?auto=format&fit=crop&w=800&q=80",
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
            "featured_image": "https://images.unsplash.com/photo-1608755728617-aefab37d2edd?auto=format&fit=crop&w=800&q=80",
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
            "featured_image": "https://images.unsplash.com/photo-1608755728617-aefab37d2edd?auto=format&fit=crop&w=800&q=80",
            "description": "Divine Goddess Saraswati with Veena in 999 silver.",
            "specifications": "Material: 999 Fine Silver | Weight: 175g"
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
            "featured_image": "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80",
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
            "featured_image": "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80",
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
            "featured_image": "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80",
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
            "featured_image": "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80",
            "description": "Ergonomic silver glass tumbler for water and milk.",
            "specifications": "Material: 925 Sterling Silver | Weight: 90g | Capacity: 250ml"
        },
        {
            "title": "Handcrafted Sterling Silver Dessert Spoons (Set of 2)",
            "slug": "handcrafted-sterling-silver-dessert-spoons-set-of-2",
            "sku": "SBS-DT-005",
            "category_slug": "silver-dining-tableware",
            "subcategory": "Silver Spoons",
            "purity": "925 Sterling Silver",
            "weight_g": 40.0,
            "retail_price": 5400.0,
            "wholesale_price": 4200.0,
            "min_wholesale_qty": 12,
            "stock": 60,
            "featured_image": "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80",
            "description": "Pair of mirror-finish silver dessert spoons with lotus engraved handles.",
            "specifications": "Material: 925 Sterling Silver | Weight: 40g (Pair)"
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
            "featured_image": "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=800&q=80",
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
            "featured_image": "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=800&q=80",
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
            "featured_image": "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=800&q=80",
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
            "featured_image": "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=800&q=80",
            "description": "Luxury gift box with baby glass, bowl, spoon, and anklets.",
            "specifications": "Material: 925 Sterling Silver | Weight: 120g"
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
            "featured_image": "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80",
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
            "featured_image": "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80",
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
            "featured_image": "https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&w=800&q=80",
            "description": "999 Fine Silver wedding coin packaged in acrylic blister card.",
            "specifications": "Material: 999 Fine Silver | Weight: 10g"
        },

        # --- Category 6: Silver Jewellery ---
        {
            "title": "Antique Nakshi Peacock Silver Payal Anklet",
            "slug": "antique-nakshi-peacock-silver-payal-anklet",
            "sku": "SBS-JWL-001",
            "category_slug": "silver-jewellery",
            "subcategory": "Silver Anklets",
            "purity": "925 Sterling Silver",
            "weight_g": 85.0,
            "retail_price": 12800.0,
            "wholesale_price": 10200.0,
            "min_wholesale_qty": 6,
            "stock": 25,
            "featured_image": "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80",
            "description": "Heritage South Indian temple silver payal pair adorned with ruby stones.",
            "specifications": "Material: 925 Sterling Silver | Weight: 85g"
        },
        {
            "title": "Handcrafted Sterling Silver Kada Bracelet",
            "slug": "handcrafted-sterling-silver-kada-bracelet",
            "sku": "SBS-JWL-002",
            "category_slug": "silver-jewellery",
            "subcategory": "Silver Bracelets",
            "purity": "925 Sterling Silver",
            "weight_g": 42.0,
            "retail_price": 6300.0,
            "wholesale_price": 4900.0,
            "min_wholesale_qty": 10,
            "stock": 35,
            "featured_image": "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80",
            "description": "Solid unisex silver kada with embossed floral accents.",
            "specifications": "Material: 925 Sterling Silver | Weight: 42g"
        },
        {
            "title": "Adjustable Silver Solitaire Gemstone Ring",
            "slug": "adjustable-silver-solitaire-gemstone-ring",
            "sku": "SBS-JWL-003",
            "category_slug": "silver-jewellery",
            "subcategory": "Silver Rings",
            "purity": "925 Sterling Silver",
            "weight_g": 6.5,
            "retail_price": 1450.0,
            "wholesale_price": 980.0,
            "min_wholesale_qty": 20,
            "stock": 80,
            "featured_image": "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80",
            "description": "Modern 925 sterling silver ring set with CZ solitaire.",
            "specifications": "Material: 925 Sterling Silver | Weight: 6.5g"
        },
        {
            "title": "Traditional Silver Hasli Choker Necklace",
            "slug": "traditional-silver-hasli-choker-necklace",
            "sku": "SBS-JWL-004",
            "category_slug": "silver-jewellery",
            "subcategory": "Silver Necklaces",
            "purity": "925 Sterling Silver",
            "weight_g": 110.0,
            "retail_price": 16800.0,
            "wholesale_price": 13400.0,
            "min_wholesale_qty": 4,
            "stock": 12,
            "featured_image": "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80",
            "description": "Authentic silver Hasli necklace with oxidized antique finish.",
            "specifications": "Material: 925 Sterling Silver | Weight: 110g"
        },

        # --- Category 7: Silver Coins & Bars ---
        {
            "title": "999 Pure Silver Lakshmi Ganesha Coin 50g",
            "slug": "999-pure-silver-lakshmi-ganesha-coin-50g",
            "sku": "SBS-CB-001",
            "category_slug": "silver-coins-bars",
            "subcategory": "Lakshmi Coins",
            "purity": "999 Fine Silver",
            "weight_g": 50.0,
            "retail_price": 6800.0,
            "wholesale_price": 5400.0,
            "min_wholesale_qty": 10,
            "stock": 100,
            "featured_image": "https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&w=800&q=80",
            "description": "High-relief 999 fine silver Lakshmi coin in tamper-proof card.",
            "specifications": "Purity: 999 Fine Silver | Weight: 50g | Certification: NABL Hallmarked"
        },
        {
            "title": "Lord Tirupati Balaji 999 Silver Coin 100g",
            "slug": "lord-tirupati-balaji-999-silver-coin-100g",
            "sku": "SBS-CB-002",
            "category_slug": "silver-coins-bars",
            "subcategory": "Balaji Coins",
            "purity": "999 Fine Silver",
            "weight_g": 100.0,
            "retail_price": 13200.0,
            "wholesale_price": 10800.0,
            "min_wholesale_qty": 5,
            "stock": 60,
            "featured_image": "https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&w=800&q=80",
            "description": "Mirror-finish Balaji 100g silver coin for investment and gifting.",
            "specifications": "Purity: 999 Fine Silver | Weight: 100g"
        },
        {
            "title": "999 Pure Silver Investment Bar 250g",
            "slug": "999-pure-silver-investment-bar-250g",
            "sku": "SBS-CB-003",
            "category_slug": "silver-coins-bars",
            "subcategory": "Silver Bars",
            "purity": "999 Fine Silver",
            "weight_g": 250.0,
            "retail_price": 32500.0,
            "wholesale_price": 27000.0,
            "min_wholesale_qty": 3,
            "stock": 30,
            "featured_image": "https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&w=800&q=80",
            "description": "Minted 250 gram silver bullion bar stamped with serial number.",
            "specifications": "Purity: 999 Fine Silver | Weight: 250g | Assay Certified"
        },

        # --- Category 8: Silver Home Décor ---
        {
            "title": "Decorative Hand-Carved Silver Urli Bowl",
            "slug": "decorative-hand-carved-silver-urli-bowl",
            "sku": "SBS-HD-001",
            "category_slug": "silver-home-decor",
            "subcategory": "Silver Urli",
            "purity": "925 Sterling Silver",
            "weight_g": 310.0,
            "retail_price": 42000.0,
            "wholesale_price": 33500.0,
            "min_wholesale_qty": 3,
            "stock": 10,
            "featured_image": "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80",
            "description": "Grand silver urli bowl for floating flowers and floating tealights.",
            "specifications": "Material: 925 Sterling Silver | Weight: 310g | Diameter: 12 inches"
        },
        {
            "title": "Silver Peacock Centerpiece Showpiece",
            "slug": "silver-peacock-centerpiece-showpiece",
            "sku": "SBS-HD-002",
            "category_slug": "silver-home-decor",
            "subcategory": "Silver Showpieces",
            "purity": "999 Fine Silver",
            "weight_g": 195.0,
            "retail_price": 28900.0,
            "wholesale_price": 23000.0,
            "min_wholesale_qty": 4,
            "stock": 15,
            "featured_image": "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80",
            "description": "Exquisite dancing peacock showpiece on teakwood base.",
            "specifications": "Material: 999 Fine Silver | Weight: 195g"
        },

        # --- Category 9: Silver Corporate & Premium Gifts ---
        {
            "title": "Custom Engraved Silver Corporate Memento Trophy",
            "slug": "custom-engraved-silver-corporate-memento-trophy",
            "sku": "SBS-CG-001",
            "category_slug": "silver-corporate-premium-gifts",
            "subcategory": "Silver Trophies",
            "purity": "925 Sterling Silver",
            "weight_g": 280.0,
            "retail_price": 38000.0,
            "wholesale_price": 29500.0,
            "min_wholesale_qty": 5,
            "stock": 20,
            "featured_image": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80",
            "description": "Executive silver trophy plaque with customized laser company logo engraving.",
            "specifications": "Material: 925 Sterling Silver | Weight: 280g"
        },
        {
            "title": "Corporate Executive Silver Pen & Coin Gift Box",
            "slug": "corporate-executive-silver-pen-coin-gift-box",
            "sku": "SBS-CG-002",
            "category_slug": "silver-corporate-premium-gifts",
            "subcategory": "Corporate Gift Sets",
            "purity": "999 Fine Silver",
            "weight_g": 75.0,
            "retail_price": 10500.0,
            "wholesale_price": 8200.0,
            "min_wholesale_qty": 10,
            "stock": 35,
            "featured_image": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80",
            "description": "Luxury wooden presentation box housing silver coin and silver pen.",
            "specifications": "Material: 999 Fine Silver | Weight: 75g"
        },

        # --- Category 10: Customized Silver Products ---
        {
            "title": "Bespoke Laser Name Engraved Silver Bar 50g",
            "slug": "bespoke-laser-name-engraved-silver-bar-50g",
            "sku": "SBS-CP-001",
            "category_slug": "customized-silver-products",
            "subcategory": "Name Engraving",
            "purity": "999 Fine Silver",
            "weight_g": 50.0,
            "retail_price": 7200.0,
            "wholesale_price": 5700.0,
            "min_wholesale_qty": 10,
            "stock": 50,
            "featured_image": "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80",
            "description": "Customized 999 fine silver bar laser-engraved with recipient name or wedding date.",
            "specifications": "Material: 999 Fine Silver | Weight: 50g | Laser Customized"
        },
        {
            "title": "3D High Relief Photo Engraved Silver Coin 20g",
            "slug": "3d-high-relief-photo-engraved-silver-coin-20g",
            "sku": "SBS-CP-002",
            "category_slug": "customized-silver-products",
            "subcategory": "Photo Engraving",
            "purity": "999 Fine Silver",
            "weight_g": 20.0,
            "retail_price": 3200.0,
            "wholesale_price": 2400.0,
            "min_wholesale_qty": 15,
            "stock": 60,
            "featured_image": "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80",
            "description": "Personalized 999 silver coin minted with your custom family portrait or logo.",
            "specifications": "Material: 999 Fine Silver | Weight: 20g"
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
    print("[+] Sai Balaji Silverworks Database successfully seeded with 10 main categories and subcategory products!")

if __name__ == "__main__":
    seed_database()
