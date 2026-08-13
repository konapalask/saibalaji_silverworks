import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from app.core.database import get_db
from app.models.models import RetailOrder, RetailOrderItem, Product, User, OrderStatus
from app.schemas.schemas import RetailOrderCreate, RetailOrderOut, RetailOrderStatusUpdate
from app.api.auth import get_current_user, get_current_admin

router = APIRouter(prefix="/orders", tags=["Retail Orders"])

@router.post("", response_model=RetailOrderOut, status_code=status.HTTP_201_CREATED)
def create_retail_order(
    order_in: RetailOrderCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(lambda: None)  # Optional auth
):
    if not order_in.items:
        raise HTTPException(status_code=400, detail="Cart items cannot be empty")

    order_number = f"SBS-ORD-{uuid.uuid4().hex[:8].upper()}"
    subtotal = 0.0
    order_items = []

    for item in order_in.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail=f"Product ID {item.product_id} not found")
        if product.stock < item.quantity:
            raise HTTPException(status_code=400, detail=f"Insufficient stock for {product.title}")

        item_subtotal = product.retail_price * item.quantity
        subtotal += item_subtotal

        # Stock deduction
        product.stock -= item.quantity

        roi = RetailOrderItem(
            product_id=product.id,
            product_name=product.title,
            product_sku=product.sku,
            unit_price=product.retail_price,
            quantity=item.quantity,
            subtotal=item_subtotal
        )
        order_items.append(roi)

    shipping_charge = 0.0 if subtotal > 5000 else 150.0
    tax_amount = round(subtotal * 0.03, 2)  # 3% GST on silver
    grand_total = subtotal + shipping_charge + tax_amount

    order = RetailOrder(
        order_number=order_number,
        user_id=current_user.id if current_user else None,
        customer_name=order_in.customer_name,
        customer_email=order_in.customer_email,
        customer_phone=order_in.customer_phone,
        shipping_address=order_in.shipping_address,
        shipping_city=order_in.shipping_city,
        shipping_state=order_in.shipping_state,
        shipping_pincode=order_in.shipping_pincode,
        subtotal=subtotal,
        shipping_charge=shipping_charge,
        tax_amount=tax_amount,
        discount_amount=0.0,
        grand_total=grand_total,
        status=OrderStatus.PAYMENT_CONFIRMED,
        payment_status="PAID",
        payment_method=order_in.payment_method,
        payment_id=f"PAY-{uuid.uuid4().hex[:10].upper()}",
        items=order_items
    )

    db.add(order)
    db.commit()
    db.refresh(order)

    return db.query(RetailOrder).options(joinedload(RetailOrder.items)).filter(RetailOrder.id == order.id).first()

@router.get("/my-orders", response_model=List[RetailOrderOut])
def get_my_orders(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(RetailOrder).options(joinedload(RetailOrder.items)).filter(
        (RetailOrder.user_id == current_user.id) | (RetailOrder.customer_email == current_user.email)
    ).order_by(RetailOrder.created_at.desc()).all()

@router.get("/admin/all", response_model=List[RetailOrderOut])
def get_all_orders_admin(
    status_filter: Optional[OrderStatus] = None,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    query = db.query(RetailOrder).options(joinedload(RetailOrder.items))
    if status_filter:
        query = query.filter(RetailOrder.status == status_filter)
    return query.order_by(RetailOrder.created_at.desc()).all()

@router.get("/{order_number}", response_model=RetailOrderOut)
def get_order_by_number(order_number: str, db: Session = Depends(get_db)):
    order = db.query(RetailOrder).options(joinedload(RetailOrder.items)).filter(
        RetailOrder.order_number == order_number
    ).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

@router.put("/admin/{order_id}/status", response_model=RetailOrderOut)
def update_order_status(
    order_id: int,
    status_update: RetailOrderStatusUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    order = db.query(RetailOrder).filter(RetailOrder.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    order.status = status_update.status
    db.commit()
    return db.query(RetailOrder).options(joinedload(RetailOrder.items)).filter(RetailOrder.id == order_id).first()
