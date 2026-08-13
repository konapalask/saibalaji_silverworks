export type UserRole = 'CUSTOMER' | 'ADMIN' | 'SUPER_ADMIN';

export interface User {
  id: number;
  email: string;
  full_name: string;
  phone?: string;
  company_name?: string;
  gstin?: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  is_featured: boolean;
  created_at: string;
}

export type ProductType = 'RETAIL' | 'WHOLESALE' | 'BOTH';

export interface ProductImage {
  id: number;
  image_url: string;
  display_order: number;
}

export interface Product {
  id: number;
  title: string;
  slug: string;
  sku: string;
  category_id: number;
  product_type: ProductType;
  silver_purity: string;
  weight_g: number;
  retail_price: number;
  wholesale_price?: number;
  min_wholesale_qty: number;
  stock: number;
  description?: string;
  specifications?: string;
  featured_image: string;
  is_featured: boolean;
  is_new_arrival: boolean;
  is_active: boolean;
  category?: Category;
  images?: ProductImage[];
  created_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface WholesaleCartItem {
  product: Product;
  requested_quantity: number;
  notes?: string;
}

export interface RetailOrderItem {
  id: number;
  product_id: number;
  product_name: string;
  product_sku: string;
  unit_price: number;
  quantity: number;
  subtotal: number;
}

export interface RetailOrder {
  id: number;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_state: string;
  shipping_pincode: string;
  subtotal: number;
  shipping_charge: number;
  tax_amount: number;
  discount_amount: number;
  grand_total: number;
  status: string;
  payment_status: string;
  payment_method: string;
  created_at: string;
  items: RetailOrderItem[];
}

export interface WholesaleRequestItem {
  id: number;
  product_id: number;
  product_name: string;
  product_sku: string;
  requested_quantity: number;
  notes?: string;
}

export interface WholesaleRequest {
  id: number;
  request_number: string;
  company_name: string;
  contact_person: string;
  phone: string;
  email: string;
  gstin?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  status: string;
  expected_delivery_date?: string;
  notes?: string;
  created_at: string;
  items: WholesaleRequestItem[];
}

export interface QuotationItem {
  id: number;
  product_id: number;
  product_name: string;
  product_sku: string;
  purity: string;
  weight_g: number;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface Quotation {
  id: number;
  quotation_number: string;
  wholesale_request_id: number;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  shipping_charge: number;
  grand_total: number;
  status: string;
  valid_until: string;
  payment_terms: string;
  delivery_terms: string;
  notes?: string;
  created_at: string;
  items: QuotationItem[];
}

export interface DashboardStats {
  total_revenue: number;
  retail_orders_count: number;
  wholesale_requests_count: number;
  pending_orders_count: number;
  total_products_count: number;
  total_customers_count: number;
  recent_orders: RetailOrder[];
  recent_wholesale: WholesaleRequest[];
}

export interface CompanyVideo {
  id: number;
  title: string;
  description?: string;
  video_url: string;
  thumbnail_url?: string;
  section: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface ManufacturingStep {
  step: string;
  title: string;
  description: string;
  image: string;
  details: string;
}

