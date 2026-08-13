import enum
from datetime import datetime, timezone
from sqlalchemy import (
    Column, Integer, String, Text, Float, Boolean, DateTime, ForeignKey, Enum as SQLEnum
)
from sqlalchemy.orm import relationship
from app.core.database import Base

class UserRole(str, enum.Enum):
    CUSTOMER = "CUSTOMER"
    ADMIN = "ADMIN"
    SUPER_ADMIN = "SUPER_ADMIN"

class ProductType(str, enum.Enum):
    RETAIL = "RETAIL"
    WHOLESALE = "WHOLESALE"
    BOTH = "BOTH"

class OrderStatus(str, enum.Enum):
    PENDING_PAYMENT = "Pending Payment"
    PAYMENT_CONFIRMED = "Payment Confirmed"
    PROCESSING = "Processing"
    PACKED = "Packed"
    SHIPPED = "Shipped"
    OUT_FOR_DELIVERY = "Out for Delivery"
    DELIVERED = "Delivered"
    CANCELLED = "Cancelled"

class WholesaleStatus(str, enum.Enum):
    NEW = "New"
    UNDER_REVIEW = "Under Review"
    QUOTATION_PREPARED = "Quotation Prepared"
    QUOTATION_SENT = "Quotation Sent"
    APPROVED = "Approved"
    REJECTED = "Rejected"
    COMPLETED = "Completed"

class QuotationStatus(str, enum.Enum):
    DRAFT = "Draft"
    SENT = "Sent"
    ACCEPTED = "Accepted"
    REJECTED = "Rejected"
    EXPIRED = "Expired"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    phone = Column(String(50), nullable=True)
    company_name = Column(String(255), nullable=True)
    gstin = Column(String(50), nullable=True)
    role = Column(SQLEnum(UserRole), default=UserRole.CUSTOMER, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    orders = relationship("RetailOrder", back_populates="user")
    wholesale_requests = relationship("WholesaleRequest", back_populates="user")
    wishlists = relationship("Wishlist", back_populates="user", cascade="all, delete-orphan")

class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, unique=True)
    slug = Column(String(255), nullable=False, unique=True)
    description = Column(Text, nullable=True)
    image_url = Column(String(500), nullable=True)
    is_featured = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    products = relationship("Product", back_populates="category")

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    slug = Column(String(255), nullable=False, unique=True, index=True)
    sku = Column(String(100), nullable=False, unique=True, index=True)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    
    product_type = Column(SQLEnum(ProductType), default=ProductType.BOTH, nullable=False)
    silver_purity = Column(String(100), default="925 Sterling Silver")
    weight_g = Column(Float, nullable=False, default=10.0)
    
    retail_price = Column(Float, nullable=False, default=0.0)
    wholesale_price = Column(Float, nullable=True, default=0.0)
    min_wholesale_qty = Column(Integer, default=10)
    stock = Column(Integer, default=50)
    
    description = Column(Text, nullable=True)
    specifications = Column(Text, nullable=True)
    featured_image = Column(String(500), nullable=False)
    
    is_featured = Column(Boolean, default=True)
    is_new_arrival = Column(Boolean, default=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    category = relationship("Category", back_populates="products")
    images = relationship("ProductImage", back_populates="product", cascade="all, delete-orphan")

class ProductImage(Base):
    __tablename__ = "product_images"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    image_url = Column(String(500), nullable=False)
    display_order = Column(Integer, default=0)

    product = relationship("Product", back_populates="images")

class RetailOrder(Base):
    __tablename__ = "retail_orders"

    id = Column(Integer, primary_key=True, index=True)
    order_number = Column(String(100), unique=True, index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    customer_name = Column(String(255), nullable=False)
    customer_email = Column(String(255), nullable=False)
    customer_phone = Column(String(50), nullable=False)
    
    shipping_address = Column(Text, nullable=False)
    shipping_city = Column(String(100), nullable=False)
    shipping_state = Column(String(100), nullable=False)
    shipping_pincode = Column(String(20), nullable=False)
    
    subtotal = Column(Float, nullable=False)
    shipping_charge = Column(Float, default=0.0)
    tax_amount = Column(Float, default=0.0)
    discount_amount = Column(Float, default=0.0)
    grand_total = Column(Float, nullable=False)
    
    status = Column(SQLEnum(OrderStatus), default=OrderStatus.PAYMENT_CONFIRMED)
    payment_status = Column(String(50), default="PAID")
    payment_method = Column(String(50), default="UPI / Razorpay")
    payment_id = Column(String(100), nullable=True)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="orders")
    items = relationship("RetailOrderItem", back_populates="order", cascade="all, delete-orphan")

class RetailOrderItem(Base):
    __tablename__ = "retail_order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("retail_orders.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    
    product_name = Column(String(255), nullable=False)
    product_sku = Column(String(100), nullable=False)
    unit_price = Column(Float, nullable=False)
    quantity = Column(Integer, nullable=False)
    subtotal = Column(Float, nullable=False)

    order = relationship("RetailOrder", back_populates="items")

class WholesaleRequest(Base):
    __tablename__ = "wholesale_requests"

    id = Column(Integer, primary_key=True, index=True)
    request_number = Column(String(100), unique=True, index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    company_name = Column(String(255), nullable=False)
    contact_person = Column(String(255), nullable=False)
    phone = Column(String(50), nullable=False)
    email = Column(String(255), nullable=False)
    gstin = Column(String(50), nullable=True)
    
    address = Column(Text, nullable=False)
    city = Column(String(100), nullable=False)
    state = Column(String(100), nullable=False)
    pincode = Column(String(20), nullable=False)
    
    status = Column(SQLEnum(WholesaleStatus), default=WholesaleStatus.NEW)
    expected_delivery_date = Column(String(50), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="wholesale_requests")
    items = relationship("WholesaleRequestItem", back_populates="request", cascade="all, delete-orphan")
    quotations = relationship("Quotation", back_populates="wholesale_request")

class WholesaleRequestItem(Base):
    __tablename__ = "wholesale_request_items"

    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(Integer, ForeignKey("wholesale_requests.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    
    product_name = Column(String(255), nullable=False)
    product_sku = Column(String(100), nullable=False)
    requested_quantity = Column(Integer, nullable=False)
    notes = Column(String(255), nullable=True)

    request = relationship("WholesaleRequest", back_populates="items")

class Quotation(Base):
    __tablename__ = "quotations"

    id = Column(Integer, primary_key=True, index=True)
    quotation_number = Column(String(100), unique=True, index=True, nullable=False)
    wholesale_request_id = Column(Integer, ForeignKey("wholesale_requests.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    subtotal = Column(Float, nullable=False, default=0.0)
    discount_amount = Column(Float, nullable=False, default=0.0)
    tax_amount = Column(Float, nullable=False, default=0.0)
    shipping_charge = Column(Float, nullable=False, default=0.0)
    grand_total = Column(Float, nullable=False, default=0.0)
    
    status = Column(SQLEnum(QuotationStatus), default=QuotationStatus.SENT)
    valid_until = Column(String(50), default="30 Days from Issue")
    payment_terms = Column(String(255), default="50% Advance, 50% Before Dispatch")
    delivery_terms = Column(String(255), default="Dispatched within 7-10 business days")
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    wholesale_request = relationship("WholesaleRequest", back_populates="quotations")
    items = relationship("QuotationItem", back_populates="quotation", cascade="all, delete-orphan")

class QuotationItem(Base):
    __tablename__ = "quotation_items"

    id = Column(Integer, primary_key=True, index=True)
    quotation_id = Column(Integer, ForeignKey("quotations.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    
    product_name = Column(String(255), nullable=False)
    product_sku = Column(String(100), nullable=False)
    purity = Column(String(100), default="925 Sterling Silver")
    weight_g = Column(Float, default=10.0)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Float, nullable=False)
    subtotal = Column(Float, nullable=False)

    quotation = relationship("Quotation", back_populates="items")

class Wishlist(Base):
    __tablename__ = "wishlists"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="wishlists")
    product = relationship("Product")

class CMSContent(Base):
    __tablename__ = "cms_content"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String(100), unique=True, index=True, nullable=False)
    title = Column(String(255), nullable=True)
    content = Column(Text, nullable=False)
    media_url = Column(String(500), nullable=True)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class CompanyVideo(Base):
    __tablename__ = "company_videos"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    video_url = Column(String(500), nullable=False)
    thumbnail_url = Column(String(500), nullable=True)
    section = Column(String(100), default="story")  # hero, story, manufacturing, craftsmen
    sort_order = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

