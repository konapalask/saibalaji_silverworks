from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from app.core.database import get_db
from app.models.models import RetailOrder, WholesaleRequest, Product, User, UserRole, OrderStatus
from app.schemas.schemas import DashboardStats
from app.api.auth import get_current_admin

router = APIRouter(prefix="/dashboard", tags=["Admin Dashboard"])

@router.get("", response_model=DashboardStats)
@router.get("/analytics", response_model=DashboardStats)
def get_dashboard_stats(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    total_revenue = db.query(func.sum(RetailOrder.grand_total)).scalar() or 0.0
    retail_orders_count = db.query(RetailOrder).count()
    wholesale_requests_count = db.query(WholesaleRequest).count()
    pending_orders_count = db.query(RetailOrder).filter(RetailOrder.status == OrderStatus.PROCESSING).count()
    total_products_count = db.query(Product).filter(Product.is_active == True).count()
    total_customers_count = db.query(User).filter(User.role == UserRole.CUSTOMER).count()

    recent_orders = db.query(RetailOrder).options(joinedload(RetailOrder.items)).order_by(
        RetailOrder.created_at.desc()
    ).limit(5).all()

    recent_wholesale = db.query(WholesaleRequest).options(joinedload(WholesaleRequest.items)).order_by(
        WholesaleRequest.created_at.desc()
    ).limit(5).all()

    return {
        "total_revenue": float(total_revenue),
        "retail_orders_count": retail_orders_count,
        "wholesale_requests_count": wholesale_requests_count,
        "pending_orders_count": pending_orders_count,
        "total_products_count": total_products_count,
        "total_customers_count": total_customers_count,
        "recent_orders": recent_orders,
        "recent_wholesale": recent_wholesale
    }
