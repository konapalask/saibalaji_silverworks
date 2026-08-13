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

    # ... (code preserved)


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

    # 2. Categories
    categories_data = [
        {"name": "Silver Jewellery", "slug": "silver-jewellery", "description": "Exquisite 925 sterling silver necklaces, bracelets, earrings, and rings.", "image_url": "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80"},
        {"name": "Silver Idols", "slug": "silver-idols", "description": "Handcrafted pure silver deities including Lakshmi, Ganesha, and Balaji idols.", "image_url": "https://images.unsplash.com/photo-1608755728617-aefab37d2edd?auto=format&fit=crop&w=800&q=80"},
        {"name": "Silver Pooja Items", "slug": "silver-pooja-items", "description": "Pure silver diyas, kalash, thali sets, and sacred ritual accessories.", "image_url": "https://images.unsplash.com/photo-1616038242814-a6eac7f46688?auto=format&fit=crop&w=800&q=80"},
        {"name": "Silver Utensils", "slug": "silver-utensils", "description": "Royal silver dinner sets, bowls, silver tumblers, and baby feeding sets.", "image_url": "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80"},
        {"name": "Silver Home Décor", "slug": "silver-home-decor", "description": "Ornate silver flower vases, centerpieces, candle stands, and artifacts.", "image_url": "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80"},
        {"name": "Silver Gifts", "slug": "silver-gifts", "description": "Elegant silver coins, kumkum boxes, gift envelopes, and keepsake items.", "image_url": "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80"},
        {"name": "Silver Corporate Gifts", "slug": "silver-corporate-gifts", "description": "Premium silver desk accents, customized coins, trophies, and executive gifts.", "image_url": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80"},
        {"name": "Antique Silverwork", "slug": "antique-silverwork", "description": "Traditional temple jewelry and heritage silver artifacts crafted by master artisans.", "image_url": "https://images.unsplash.com/photo-1600003014755-ba31aa59c4b6?auto=format&fit=crop&w=800&q=80"},
        {"name": "Silver Articles", "slug": "silver-articles", "description": "Precision silver rods, bars, custom silver casting, and raw silver components.", "image_url": "https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&w=800&q=80"},
        {"name": "New Arrivals", "slug": "new-arrivals", "description": "Latest seasonal silver creations fresh from our manufacturing facility.", "image_url": "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80"}
    ]

    cat_map = {}
    for c in categories_data:
        cat = Category(name=c["name"], slug=c["slug"], description=c["description"], image_url=c["image_url"], is_featured=True)
        db.add(cat)
        db.commit()
        db.refresh(cat)
        cat_map[c["slug"]] = cat.id

    # 3. Products Data
    products_data = [
        {
            "title": "Royal Silver Lakshmi Ganesha Idol Set",
            "slug": "royal-silver-lakshmi-ganesha-idol-set",
            "sku": "SBS-IDL-001",
            "category_slug": "silver-idols",
            "purity": "999 Fine Silver",
            "weight_g": 180.0,
            "retail_price": 28500.0,
            "wholesale_price": 22000.0,
            "min_wholesale_qty": 5,
            "stock": 35,
            "product_type": ProductType.BOTH,
            "featured_image": "https://images.unsplash.com/photo-1608755728617-aefab37d2edd?auto=format&fit=crop&w=800&q=80",
            "description": "Mastercrafted 999 Fine Silver Lakshmi & Ganesha idol pair, finished with anti-tarnish protective coating. Ideal for Diwali puja, home mandir, and auspicious wedding gifting.",
            "specifications": "Material: 999 Fine Silver | Weight: 180 grams | Height: 4.5 inches | Certification: Hallmarked"
        },
        {
            "title": "Handcrafted Sterling Silver Nakshi Diya",
            "slug": "handcrafted-sterling-silver-nakshi-diya",
            "sku": "SBS-POA-002",
            "category_slug": "silver-pooja-items",
            "purity": "925 Sterling Silver",
            "weight_g": 65.0,
            "retail_price": 9800.0,
            "wholesale_price": 7500.0,
            "min_wholesale_qty": 10,
            "stock": 60,
            "product_type": ProductType.BOTH,
            "featured_image": "https://images.unsplash.com/photo-1616038242814-a6eac7f46688?auto=format&fit=crop&w=800&q=80",
            "description": "Elaborately engraved 925 sterling silver oil lamp featuring intricate floral Nakshi work.",
            "specifications": "Material: 925 Sterling Silver | Weight: 65 grams | Diameter: 3.5 inches"
        },
        {
            "title": "Heritage Floral Silver Necklace Set",
            "slug": "heritage-floral-silver-necklace-set",
            "sku": "SBS-JWL-003",
            "category_slug": "silver-jewellery",
            "purity": "925 Sterling Silver",
            "weight_g": 85.0,
            "retail_price": 14500.0,
            "wholesale_price": 11200.0,
            "min_wholesale_qty": 10,
            "stock": 25,
            "product_type": ProductType.BOTH,
            "featured_image": "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80",
            "description": "Editorial 925 sterling silver necklace paired with matching stud earrings, styled with subtle oxidised detailing.",
            "specifications": "Material: 925 Sterling Silver | Weight: 85 grams | Clasp: Adjustable Hook"
        },
        {
            "title": "5-Piece Royal Silver Dinner Set",
            "slug": "5-piece-royal-silver-dinner-set",
            "sku": "SBS-UTN-004",
            "category_slug": "silver-utensils",
            "purity": "925 Sterling Silver",
            "weight_g": 650.0,
            "retail_price": 89000.0,
            "wholesale_price": 74000.0,
            "min_wholesale_qty": 3,
            "stock": 15,
            "product_type": ProductType.BOTH,
            "featured_image": "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80",
            "description": "Luxurious 5-piece solid silver dinner set comprising a large thali, two curry bowls, one sweet dish, and a silver glass tumbler.",
            "specifications": "Material: 925 Sterling Silver | Total Weight: 650 grams | Finish: High Polish Mirror"
        },
        {
            "title": "Ornate Silver Kalash with Mango Leaves",
            "slug": "ornate-silver-kalash-with-mango-leaves",
            "sku": "SBS-POA-005",
            "category_slug": "silver-pooja-items",
            "purity": "925 Sterling Silver",
            "weight_g": 220.0,
            "retail_price": 32000.0,
            "wholesale_price": 25500.0,
            "min_wholesale_qty": 4,
            "stock": 20,
            "product_type": ProductType.BOTH,
            "featured_image": "https://images.unsplash.com/photo-1600003014755-ba31aa59c4b6?auto=format&fit=crop&w=800&q=80",
            "description": "Sacred silver Kalash vessel topped with hand-carved silver mango leaves and coconut structure.",
            "specifications": "Material: 925 Sterling Silver | Weight: 220 grams | Height: 6 inches"
        },
        {
            "title": "Minimalist Solid Silver Cuff Bracelet",
            "slug": "minimalist-solid-silver-cuff-bracelet",
            "sku": "SBS-JWL-006",
            "category_slug": "silver-jewellery",
            "purity": "925 Sterling Silver",
            "weight_g": 38.0,
            "retail_price": 6200.0,
            "wholesale_price": 4800.0,
            "min_wholesale_qty": 15,
            "stock": 80,
            "product_type": ProductType.BOTH,
            "featured_image": "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80",
            "description": "Contemporary unisex open-cuff bracelet fashioned from heavy solid 925 silver with rounded edges.",
            "specifications": "Material: 925 Sterling Silver | Weight: 38 grams | Fit: Adjustable"
        },
        {
            "title": "Artisanal Silver Elephant Figurine Pair",
            "slug": "artisanal-silver-elephant-figurine-pair",
            "sku": "SBS-DEC-007",
            "category_slug": "silver-home-decor",
            "purity": "999 Fine Silver",
            "weight_g": 140.0,
            "retail_price": 22500.0,
            "wholesale_price": 17800.0,
            "min_wholesale_qty": 5,
            "stock": 22,
            "product_type": ProductType.BOTH,
            "featured_image": "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80",
            "description": "A pair of sculpted silver elephants representing luck, prosperity, and regal heritage decor.",
            "specifications": "Material: 999 Pure Silver electroform | Weight: 140 grams"
        },
        {
            "title": "Custom 100g 999 Pure Silver Minted Bar",
            "slug": "custom-100g-999-pure-silver-minted-bar",
            "sku": "SBS-GFT-008",
            "category_slug": "silver-corporate-gifts",
            "purity": "999 Fine Silver",
            "weight_g": 100.0,
            "retail_price": 13800.0,
            "wholesale_price": 11500.0,
            "min_wholesale_qty": 20,
            "stock": 200,
            "product_type": ProductType.BOTH,
            "featured_image": "https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&w=800&q=80",
            "description": "Assayed 100g silver bar bearing the official Sai Balaji seal, packaged in tamper-proof tamper-evident blister packaging.",
            "specifications": "Purity: 999 Fine Silver | Weight: 100g | Certification: NABL Hallmarked"
        },
        {
            "title": "Silver Kumkum Box with Peacock Lid",
            "slug": "silver-kumkum-box-with-peacock-lid",
            "sku": "SBS-GFT-009",
            "category_slug": "silver-gifts",
            "purity": "925 Sterling Silver",
            "weight_g": 32.0,
            "retail_price": 4800.0,
            "wholesale_price": 3600.0,
            "min_wholesale_qty": 25,
            "stock": 70,
            "product_type": ProductType.BOTH,
            "featured_image": "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80",
            "description": "Charming traditional sindoor / kumkum box topped with a detailed peacock finial.",
            "specifications": "Material: 925 Sterling Silver | Weight: 32 grams"
        },
        {
            "title": "Executive Silver Pen & Cardholder Gift Set",
            "slug": "executive-silver-pen-cardholder-gift-set",
            "sku": "SBS-CRP-010",
            "category_slug": "silver-corporate-gifts",
            "purity": "925 Sterling Silver",
            "weight_g": 75.0,
            "retail_price": 11500.0,
            "wholesale_price": 8900.0,
            "min_wholesale_qty": 10,
            "stock": 45,
            "product_type": ProductType.BOTH,
            "featured_image": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80",
            "description": "Bespoke corporate gifting box containing a solid silver rollerball pen and a matching engraved business card case.",
            "specifications": "Material: 925 Silver accents | Weight: 75 grams total"
        }
    ]

    for p in products_data:
        cat_id = cat_map[p["category_slug"]]
        prod = Product(
            title=p["title"],
            slug=p["slug"],
            sku=p["sku"],
            category_id=cat_id,
            product_type=p["product_type"],
            silver_purity=p["purity"],
            weight_g=p["weight_g"],
            retail_price=p["retail_price"],
            wholesale_price=p["wholesale_price"],
            min_wholesale_qty=p["min_wholesale_qty"],
            stock=p["stock"],
            description=p["description"],
            specifications=p["specifications"],
            featured_image=p["featured_image"],
            is_featured=True,
            is_new_arrival=True,
            is_active=True
        )
        db.add(prod)
        db.commit()
        db.refresh(prod)

        # Add additional image
        pi = ProductImage(product_id=prod.id, image_url=p["featured_image"], display_order=0)
        db.add(pi)

    db.commit()

    # 4. Seed Retail Order
    prod1 = db.query(Product).filter(Product.sku == "SBS-IDL-001").first()
    prod2 = db.query(Product).filter(Product.sku == "SBS-POA-002").first()

    order = RetailOrder(
        order_number="SBS-ORD-88A9F102",
        user_id=customer_user.id,
        customer_name="Ananya Sharma",
        customer_email="customer@gmail.com",
        customer_phone="+91 98123 45678",
        shipping_address="Plot 42, Jubilee Hills, Road No. 10",
        shipping_city="Hyderabad",
        shipping_state="Telangana",
        shipping_pincode="500033",
        subtotal=38300.0,
        shipping_charge=0.0,
        tax_amount=1149.0,
        discount_amount=0.0,
        grand_total=39449.0,
        status=OrderStatus.SHIPPED,
        payment_status="PAID",
        payment_method="UPI / Razorpay",
        payment_id="PAY-992A881B",
        items=[
            RetailOrderItem(product_id=prod1.id, product_name=prod1.title, product_sku=prod1.sku, unit_price=28500.0, quantity=1, subtotal=28500.0),
            RetailOrderItem(product_id=prod2.id, product_name=prod2.title, product_sku=prod2.sku, unit_price=9800.0, quantity=1, subtotal=9800.0)
        ]
    )
    db.add(order)
    db.commit()

    # 5. Seed Wholesale Request & Quotation
    w_req = WholesaleRequest(
        request_number="SBW-WR-2026-000125",
        user_id=customer_user.id,
        company_name="Sharma Jewellers & Retail",
        contact_person="Ananya Sharma",
        phone="+91 98123 45678",
        email="customer@gmail.com",
        gstin="36ABCDE1234F1Z9",
        address="Suite 404, Gems & Jewellery Complex, Panjagutta",
        city="Hyderabad",
        state="Telangana",
        pincode="500082",
        status=WholesaleStatus.QUOTATION_SENT,
        expected_delivery_date="2026-09-01",
        notes="Require hallmark certificates for all bulk pieces.",
        items=[
            WholesaleRequestItem(product_id=prod1.id, product_name=prod1.title, product_sku=prod1.sku, requested_quantity=10, notes="5 boxes in red velvet packaging"),
            WholesaleRequestItem(product_id=prod2.id, product_name=prod2.title, product_sku=prod2.sku, requested_quantity=25, notes="Standard master boxes")
        ]
    )
    db.add(w_req)
    db.commit()
    db.refresh(w_req)

    quotation = Quotation(
        quotation_number="SBW-QT-2026-0099",
        wholesale_request_id=w_req.id,
        user_id=customer_user.id,
        subtotal=407500.0,
        discount_amount=15000.0,
        tax_amount=11775.0,
        shipping_charge=2500.0,
        grand_total=406775.0,
        status=QuotationStatus.SENT,
        valid_until="30 Days from Issue",
        payment_terms="50% Advance, 50% Before Dispatch",
        delivery_terms="Insured Express Logistics within 7 business days",
        notes="Official wholesale price lock applied for August batch.",
        items=[
            QuotationItem(product_id=prod1.id, product_name=prod1.title, product_sku=prod1.sku, purity="999 Fine Silver", weight_g=180.0, quantity=10, unit_price=22000.0, subtotal=220000.0),
            QuotationItem(product_id=prod2.id, product_name=prod2.title, product_sku=prod2.sku, purity="925 Sterling Silver", weight_g=65.0, quantity=25, unit_price=7500.0, subtotal=187500.0)
        ]
    )
    db.add(quotation)
    db.commit()

    # 6. CMS Content Initial Data
    cms_hero = CMSContent(
        key="homepage_hero",
        title="Crafted in Silver. Created with Precision.",
        content="From traditional craftsmanship to contemporary silver designs, Sai Balaji Silverworks creates premium silver products for retail and wholesale markets.",
        media_url="https://images.unsplash.com/photo-1608755728617-aefab37d2edd?auto=format&fit=crop&w=1600&q=80"
    )
    cms_story = CMSContent(
        key="company_story",
        title="Built on Craftsmanship. Driven by Quality.",
        content="For decades, Sai Balaji Silverworks has stood as a beacon of silver manufacturing excellence in South India. Combining ancestral metallurgic mastery with high-tech laser soldering and NABL certified hallmarking.",
        media_url="https://images.unsplash.com/photo-1600003014755-ba31aa59c4b6?auto=format&fit=crop&w=1200&q=80"
    )
    db.add(cms_hero)
    db.add(cms_story)
    db.commit()

    # 7. Seed Company Videos
    videos_data = [
        {
            "title": "The Story Behind the Silver",
            "description": "Discover the heritage, passion, and engineering precision that built Sai Balaji Silverworks.",
            "video_url": "https://assets.mixkit.co/videos/preview/mixkit-artisan-crafting-a-piece-of-jewelry-41586-large.mp4",
            "thumbnail_url": "https://images.unsplash.com/photo-1600003014755-ba31aa59c4b6?auto=format&fit=crop&w=1200&q=80",
            "section": "story",
            "sort_order": 1,
            "is_active": True
        },
        {
            "title": "Inside Our Manufacturing Unit",
            "description": "Step inside our high-precision casting and silver processing unit in Hyderabad.",
            "video_url": "https://assets.mixkit.co/videos/preview/mixkit-goldsmith-working-in-his-workshop-41584-large.mp4",
            "thumbnail_url": "https://images.unsplash.com/photo-1608755728617-aefab37d2edd?auto=format&fit=crop&w=1200&q=80",
            "section": "manufacturing",
            "sort_order": 2,
            "is_active": True
        },
        {
            "title": "Hands Behind the Craft",
            "description": "Celebrating the master silversmiths who hand-carve sacred details into every creation.",
            "video_url": "https://assets.mixkit.co/videos/preview/mixkit-jeweler-cleaning-a-ring-with-a-brush-41588-large.mp4",
            "thumbnail_url": "https://images.unsplash.com/photo-1616038242814-a6eac7f46688?auto=format&fit=crop&w=1200&q=80",
            "section": "craftsmen",
            "sort_order": 3,
            "is_active": True
        }
    ]

    for v in videos_data:
        vid = CompanyVideo(
            title=v["title"],
            description=v["description"],
            video_url=v["video_url"],
            thumbnail_url=v["thumbnail_url"],
            section=v["section"],
            sort_order=v["sort_order"],
            is_active=v["is_active"]
        )
        db.add(vid)

    db.commit()

    print("[SUCCESS] Database seeding completed successfully!")

if __name__ == "__main__":
    seed_database()
