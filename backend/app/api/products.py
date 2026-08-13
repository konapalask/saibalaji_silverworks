from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload
from app.core.database import get_db
from app.models.models import Product, ProductImage, ProductType, User
from app.schemas.schemas import ProductCreate, ProductOut
from app.api.auth import get_current_admin

router = APIRouter(prefix="/products", tags=["Products"])

@router.get("", response_model=List[ProductOut])
def get_products(
    category_id: Optional[int] = None,
    product_type: Optional[ProductType] = None,
    purity: Optional[str] = None,
    search: Optional[str] = None,
    is_featured: Optional[bool] = None,
    is_new_arrival: Optional[bool] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    sort_by: Optional[str] = "created_at_desc",
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    query = db.query(Product).options(
        joinedload(Product.category),
        joinedload(Product.images)
    ).filter(Product.is_active == True)

    if category_id:
        query = query.filter(Product.category_id == category_id)
    if product_type:
        query = query.filter(
            (Product.product_type == product_type) | (Product.product_type == ProductType.BOTH)
        )
    if purity:
        query = query.filter(Product.silver_purity.ilike(f"%{purity}%"))
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            (Product.title.ilike(search_pattern)) |
            (Product.sku.ilike(search_pattern)) |
            (Product.description.ilike(search_pattern))
        )
    if is_featured is not None:
        query = query.filter(Product.is_featured == is_featured)
    if is_new_arrival is not None:
        query = query.filter(Product.is_new_arrival == is_new_arrival)
    if min_price is not None:
        query = query.filter(Product.retail_price >= min_price)
    if max_price is not None:
        query = query.filter(Product.retail_price <= max_price)

    # Sorting
    if sort_by == "price_asc":
        query = query.order_by(Product.retail_price.asc())
    elif sort_by == "price_desc":
        query = query.order_by(Product.retail_price.desc())
    elif sort_by == "weight_asc":
        query = query.order_by(Product.weight_g.asc())
    elif sort_by == "weight_desc":
        query = query.order_by(Product.weight_g.desc())
    else:
        query = query.order_by(Product.created_at.desc())

    return query.offset(skip).limit(limit).all()

@router.get("/{id_or_slug}", response_model=ProductOut)
def get_product(id_or_slug: str, db: Session = Depends(get_db)):
    if id_or_slug.isdigit():
        product = db.query(Product).options(
            joinedload(Product.category),
            joinedload(Product.images)
        ).filter(Product.id == int(id_or_slug)).first()
    else:
        product = db.query(Product).options(
            joinedload(Product.category),
            joinedload(Product.images)
        ).filter(Product.slug == id_or_slug).first()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.post("", response_model=ProductOut, status_code=status.HTTP_201_CREATED)
def create_product(
    product_in: ProductCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    existing_sku = db.query(Product).filter(Product.sku == product_in.sku).first()
    if existing_sku:
        raise HTTPException(status_code=400, detail="SKU already exists")

    product = Product(
        title=product_in.title,
        slug=product_in.slug,
        sku=product_in.sku,
        category_id=product_in.category_id,
        product_type=product_in.product_type,
        silver_purity=product_in.silver_purity,
        weight_g=product_in.weight_g,
        retail_price=product_in.retail_price,
        wholesale_price=product_in.wholesale_price,
        min_wholesale_qty=product_in.min_wholesale_qty,
        stock=product_in.stock,
        description=product_in.description,
        specifications=product_in.specifications,
        featured_image=product_in.featured_image,
        is_featured=product_in.is_featured,
        is_new_arrival=product_in.is_new_arrival,
        is_active=product_in.is_active
    )
    db.add(product)
    db.commit()
    db.refresh(product)

    if product_in.images:
        for idx, img_url in enumerate(product_in.images):
            pi = ProductImage(product_id=product.id, image_url=img_url, display_order=idx)
            db.add(pi)
        db.commit()
        db.refresh(product)

    return db.query(Product).options(
        joinedload(Product.category),
        joinedload(Product.images)
    ).filter(Product.id == product.id).first()

@router.put("/{product_id}", response_model=ProductOut)
def update_product(
    product_id: int,
    product_in: ProductCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    for key, val in product_in.dict(exclude={"images"}).items():
        setattr(product, key, val)

    db.commit()
    return db.query(Product).options(
        joinedload(Product.category),
        joinedload(Product.images)
    ).filter(Product.id == product_id).first()

@router.delete("/{product_id}")
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    product.is_active = False
    db.commit()
    return {"message": "Product archived successfully"}
