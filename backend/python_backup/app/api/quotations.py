import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session, joinedload
from app.core.database import get_db
from app.models.models import Quotation, QuotationItem, WholesaleRequest, Product, User, WholesaleStatus, QuotationStatus
from app.schemas.schemas import QuotationCreate, QuotationOut
from app.services.pdf_service import generate_quotation_pdf
from app.api.auth import get_current_admin, get_current_user

router = APIRouter(prefix="/quotations", tags=["Quotation Management & PDF"])

@router.post("", response_model=QuotationOut, status_code=status.HTTP_201_CREATED)
def create_quotation(
    q_in: QuotationCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    w_req = db.query(WholesaleRequest).filter(WholesaleRequest.id == q_in.wholesale_request_id).first()
    if not w_req:
        raise HTTPException(status_code=404, detail="Wholesale request not found")

    quotation_number = f"SBW-QT-{uuid.uuid4().hex[:6].upper()}"
    subtotal = 0.0
    q_items = []

    for item in q_in.items:
        item_subtotal = item.quantity * item.unit_price
        subtotal += item_subtotal

        qi = QuotationItem(
            product_id=item.product_id,
            product_name=item.product_name,
            product_sku=item.product_sku,
            purity=item.purity,
            weight_g=item.weight_g,
            quantity=item.quantity,
            unit_price=item.unit_price,
            subtotal=item_subtotal
        )
        q_items.append(qi)

    tax_calc = q_in.tax_amount if q_in.tax_amount > 0 else round((subtotal - q_in.discount_amount) * 0.03, 2)
    grand_total = subtotal - q_in.discount_amount + tax_calc + q_in.shipping_charge

    quotation = Quotation(
        quotation_number=quotation_number,
        wholesale_request_id=w_req.id,
        user_id=w_req.user_id,
        subtotal=subtotal,
        discount_amount=q_in.discount_amount,
        tax_amount=tax_calc,
        shipping_charge=q_in.shipping_charge,
        grand_total=grand_total,
        status=QuotationStatus.SENT,
        valid_until=q_in.valid_until,
        payment_terms=q_in.payment_terms,
        delivery_terms=q_in.delivery_terms,
        notes=q_in.notes,
        items=q_items
    )

    db.add(quotation)
    
    # Update Wholesale Request Status
    w_req.status = WholesaleStatus.QUOTATION_SENT
    
    db.commit()
    db.refresh(quotation)

    return db.query(Quotation).options(joinedload(Quotation.items)).filter(Quotation.id == quotation.id).first()

@router.get("", response_model=List[QuotationOut])
@router.get("/all", response_model=List[QuotationOut])
def get_all_quotations(
    db: Session = Depends(get_db)
):
    return db.query(Quotation).options(joinedload(Quotation.items)).order_by(Quotation.created_at.desc()).all()

@router.get("/{quotation_id}", response_model=QuotationOut)
def get_quotation(quotation_id: int, db: Session = Depends(get_db)):
    q = db.query(Quotation).options(joinedload(Quotation.items)).filter(Quotation.id == quotation_id).first()
    if not q:
        raise HTTPException(status_code=404, detail="Quotation not found")
    return q

@router.get("/{quotation_id}/pdf")
def download_quotation_pdf(quotation_id: int, db: Session = Depends(get_db)):
    q = db.query(Quotation).options(joinedload(Quotation.items)).filter(Quotation.id == quotation_id).first()
    if not q:
        raise HTTPException(status_code=404, detail="Quotation not found")

    w_req = db.query(WholesaleRequest).filter(WholesaleRequest.id == q.wholesale_request_id).first()
    if not w_req:
        raise HTTPException(status_code=404, detail="Associated wholesale request not found")

    pdf_bytes = generate_quotation_pdf(q, w_req)

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"inline; filename=Quotation_{q.quotation_number}.pdf"}
    )
