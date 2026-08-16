import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from app.core.database import get_db
from app.models.models import WholesaleRequest, WholesaleRequestItem, Product, User, WholesaleStatus
from app.schemas.schemas import WholesaleRequestCreate, WholesaleRequestOut
from app.api.auth import get_current_user, get_current_admin

router = APIRouter(prefix="/wholesale", tags=["Wholesale B2B"])

@router.post("/requests", response_model=WholesaleRequestOut, status_code=status.HTTP_201_CREATED)
def submit_wholesale_request(
    request_in: WholesaleRequestCreate,
    db: Session = Depends(get_db)
):
    if not request_in.items:
        raise HTTPException(status_code=400, detail="Wholesale request items list cannot be empty")

    request_number = f"SBW-WR-{uuid.uuid4().hex[:6].upper()}"
    req_items = []

    for item in request_in.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail=f"Product ID {item.product_id} not found")
        
        wri = WholesaleRequestItem(
            product_id=product.id,
            product_name=product.title,
            product_sku=product.sku,
            requested_quantity=item.requested_quantity,
            notes=item.notes
        )
        req_items.append(wri)

    wholesale_req = WholesaleRequest(
        request_number=request_number,
        company_name=request_in.company_name,
        contact_person=request_in.contact_person,
        phone=request_in.phone,
        email=request_in.email,
        gstin=request_in.gstin,
        address=request_in.address,
        city=request_in.city,
        state=request_in.state,
        pincode=request_in.pincode,
        expected_delivery_date=request_in.expected_delivery_date,
        notes=request_in.notes,
        status=WholesaleStatus.NEW,
        items=req_items
    )

    db.add(wholesale_req)
    db.commit()
    db.refresh(wholesale_req)

    return db.query(WholesaleRequest).options(joinedload(WholesaleRequest.items)).filter(
        WholesaleRequest.id == wholesale_req.id
    ).first()

@router.get("/requests", response_model=List[WholesaleRequestOut])
@router.get("/admin/requests", response_model=List[WholesaleRequestOut])
def get_admin_wholesale_requests(
    status_filter: Optional[WholesaleStatus] = None,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    query = db.query(WholesaleRequest).options(joinedload(WholesaleRequest.items))
    if status_filter:
        query = query.filter(WholesaleRequest.status == status_filter)
    return query.order_by(WholesaleRequest.created_at.desc()).all()

@router.get("/my-requests", response_model=List[WholesaleRequestOut])
def get_my_wholesale_requests(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(WholesaleRequest).options(joinedload(WholesaleRequest.items)).filter(
        (WholesaleRequest.user_id == current_user.id) | (WholesaleRequest.email == current_user.email)
    ).order_by(WholesaleRequest.created_at.desc()).all()

@router.get("/requests/{request_id}", response_model=WholesaleRequestOut)
def get_wholesale_request_by_id(request_id: int, db: Session = Depends(get_db)):
    req = db.query(WholesaleRequest).options(joinedload(WholesaleRequest.items)).filter(
        WholesaleRequest.id == request_id
    ).first()
    if not req:
        raise HTTPException(status_code=404, detail="Wholesale request not found")
    return req

@router.put("/admin/requests/{request_id}/status", response_model=WholesaleRequestOut)
def update_wholesale_request_status(
    request_id: int,
    status: WholesaleStatus,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    req = db.query(WholesaleRequest).filter(WholesaleRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Wholesale request not found")
    req.status = status
    db.commit()
    return db.query(WholesaleRequest).options(joinedload(WholesaleRequest.items)).filter(
        WholesaleRequest.id == request_id
    ).first()
