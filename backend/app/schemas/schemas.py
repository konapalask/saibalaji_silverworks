from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from app.models.models import UserRole, ProductType, OrderStatus, WholesaleStatus, QuotationStatus

# Auth Schemas
class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: str
    phone: Optional[str] = None
    company_name: Optional[str] = None
    gstin: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class GoogleLoginRequest(BaseModel):
    email: EmailStr
    full_name: Optional[str] = "Google User"
    google_id: Optional[str] = None

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserOut"

class UserOut(BaseModel):
    id: int
    email: str
    full_name: str
    phone: Optional[str] = None
    company_name: Optional[str] = None
    gstin: Optional[str] = None
    role: UserRole
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    company_name: Optional[str] = None
    gstin: Optional[str] = None

# Category Schemas
class CategoryBase(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    is_featured: bool = True

class CategoryCreate(CategoryBase):
    pass

class CategoryOut(CategoryBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Product Image Schemas
class ProductImageOut(BaseModel):
    id: int
    image_url: str
    display_order: int

    class Config:
        from_attributes = True

# Product Schemas
class ProductBase(BaseModel):
    title: str
    slug: str
    sku: str
    category_id: int
    subcategory: Optional[str] = None
    product_type: ProductType = ProductType.BOTH
    silver_purity: str = "925 Sterling Silver"
    weight_g: float = 10.0
    retail_price: float = 0.0
    wholesale_price: Optional[float] = 0.0
    min_wholesale_qty: int = 10
    stock: int = 50
    description: Optional[str] = None
    specifications: Optional[str] = None
    featured_image: str
    is_featured: bool = True
    is_new_arrival: bool = True
    is_active: bool = True

class ProductCreate(ProductBase):
    images: Optional[List[str]] = []

class ProductOut(ProductBase):
    id: int
    category: Optional[CategoryOut] = None
    images: List[ProductImageOut] = []
    created_at: datetime

    class Config:
        from_attributes = True

# Retail Order Schemas
class RetailOrderItemCreate(BaseModel):
    product_id: int
    quantity: int

class RetailOrderCreate(BaseModel):
    customer_name: str
    customer_email: EmailStr
    customer_phone: str
    shipping_address: str
    shipping_city: str
    shipping_state: str
    shipping_pincode: str
    payment_method: str = "UPI / Razorpay"
    items: List[RetailOrderItemCreate]

class RetailOrderItemOut(BaseModel):
    id: int
    product_id: int
    product_name: str
    product_sku: str
    unit_price: float
    quantity: int
    subtotal: float

    class Config:
        from_attributes = True

class RetailOrderOut(BaseModel):
    id: int
    order_number: str
    customer_name: str
    customer_email: str
    customer_phone: str
    shipping_address: str
    shipping_city: str
    shipping_state: str
    shipping_pincode: str
    subtotal: float
    shipping_charge: float
    tax_amount: float
    discount_amount: float
    grand_total: float
    status: OrderStatus
    payment_status: str
    payment_method: str
    created_at: datetime
    items: List[RetailOrderItemOut]

    class Config:
        from_attributes = True

class RetailOrderStatusUpdate(BaseModel):
    status: OrderStatus

# Wholesale Schemas
class WholesaleItemCreate(BaseModel):
    product_id: int
    requested_quantity: int
    notes: Optional[str] = None

class WholesaleRequestCreate(BaseModel):
    company_name: str
    contact_person: str
    phone: str
    email: EmailStr
    gstin: Optional[str] = None
    address: str
    city: str
    state: str
    pincode: str
    expected_delivery_date: Optional[str] = None
    notes: Optional[str] = None
    items: List[WholesaleItemCreate]

class WholesaleItemOut(BaseModel):
    id: int
    product_id: int
    product_name: str
    product_sku: str
    requested_quantity: int
    notes: Optional[str] = None

    class Config:
        from_attributes = True

class WholesaleRequestOut(BaseModel):
    id: int
    request_number: str
    company_name: str
    contact_person: str
    phone: str
    email: str
    gstin: Optional[str] = None
    address: str
    city: str
    state: str
    pincode: str
    status: WholesaleStatus
    expected_delivery_date: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime
    items: List[WholesaleItemOut]

    class Config:
        from_attributes = True

# Quotation Schemas
class QuotationItemCreate(BaseModel):
    product_id: int
    product_name: str
    product_sku: str
    purity: str = "925 Sterling Silver"
    weight_g: float = 10.0
    quantity: int
    unit_price: float

class QuotationCreate(BaseModel):
    wholesale_request_id: int
    discount_amount: float = 0.0
    tax_amount: float = 0.0
    shipping_charge: float = 0.0
    valid_until: str = "30 Days from Issue"
    payment_terms: str = "50% Advance, 50% Before Dispatch"
    delivery_terms: str = "Dispatched within 7-10 business days"
    notes: Optional[str] = None
    items: List[QuotationItemCreate]

class QuotationItemOut(BaseModel):
    id: int
    product_id: int
    product_name: str
    product_sku: str
    purity: str
    weight_g: float
    quantity: int
    unit_price: float
    subtotal: float

    class Config:
        from_attributes = True

class QuotationOut(BaseModel):
    id: int
    quotation_number: str
    wholesale_request_id: int
    subtotal: float
    discount_amount: float
    tax_amount: float
    shipping_charge: float
    grand_total: float
    status: QuotationStatus
    valid_until: str
    payment_terms: str
    delivery_terms: str
    notes: Optional[str] = None
    created_at: datetime
    items: List[QuotationItemOut]

    class Config:
        from_attributes = True

# Dashboard Analytics
class DashboardStats(BaseModel):
    total_revenue: float
    retail_orders_count: int
    wholesale_requests_count: int
    pending_orders_count: int
    total_products_count: int
    total_customers_count: int
    recent_orders: List[RetailOrderOut]
    recent_wholesale: List[WholesaleRequestOut]

# CMS Schemas
class CMSContentOut(BaseModel):
    id: int
    key: str
    title: Optional[str] = None
    content: str
    media_url: Optional[str] = None
    updated_at: datetime

    class Config:
        from_attributes = True

class CMSContentUpdate(BaseModel):
    title: Optional[str] = None
    content: str
    media_url: Optional[str] = None

# Company Video Schemas
class CompanyVideoBase(BaseModel):
    title: str
    description: Optional[str] = None
    video_url: str
    thumbnail_url: Optional[str] = None
    section: str = "story" # hero, story, manufacturing, craftsmen
    sort_order: int = 0
    is_active: bool = True

class CompanyVideoCreate(CompanyVideoBase):
    pass

class CompanyVideoUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    video_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    section: Optional[str] = None
    sort_order: Optional[int] = None
    is_active: Optional[bool] = None

class CompanyVideoOut(CompanyVideoBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

