from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import Category, User
from app.schemas.schemas import CategoryCreate, CategoryOut
from app.api.auth import get_current_admin

router = APIRouter(prefix="/categories", tags=["Categories"])

@router.get("", response_model=List[CategoryOut])
def get_categories(db: Session = Depends(get_db)):
    return db.query(Category).order_by(Category.name.asc()).all()

@router.get("/{slug}", response_model=CategoryOut)
def get_category_by_slug(slug: str, db: Session = Depends(get_db)):
    cat = db.query(Category).filter(Category.slug == slug).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    return cat

@router.post("", response_model=CategoryOut, status_code=status.HTTP_201_CREATED)
def create_category(
    cat_in: CategoryCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    cat = db.query(Category).filter(Category.slug == cat_in.slug).first()
    if cat:
        raise HTTPException(status_code=400, detail="Category slug already exists")
    
    new_cat = Category(**cat_in.dict())
    db.add(new_cat)
    db.commit()
    db.refresh(new_cat)
    return new_cat
