import { ADMIN_WHATSAPP_NUMBER } from '../config/whatsappConfig';

export interface CustomerDetails {
  name: string;
  mobile: string;
  address?: string;
  city?: string;
  pincode?: string;
  notes?: string;
}

export interface SingleProductOrder {
  product: {
    id: number;
    title: string;
    sku: string;
    retail_price: number;
    wholesale_price?: number;
    featured_image?: string;
    category?: { name: string };
    subcategory?: { name: string };
  };
  quantity: number;
  unitPrice: number;
  cartType: 'RETAIL' | 'WHOLESALE';
}

export interface CartItemOrder {
  product: {
    id: number;
    title: string;
    sku: string;
    retail_price: number;
    wholesale_price?: number;
    featured_image?: string;
  };
  quantity: number;
  unitPrice: number;
  effectivePrice: number;
  itemSubtotal: number;
}

export interface FullCartOrder {
  items: CartItemOrder[];
  totalQuantity: number;
  cartType: 'RETAIL' | 'WHOLESALE';
  subtotal: number;
  tax: number;
  shipping: number;
  grandTotal: number;
}

/**
 * Generate a unique, professional order reference (e.g. SBS-20260815-4819)
 */
export const generateOrderId = (): string => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(1000 + Math.random() * 9000);
  return `SBS-${dateStr}-${random}`;
};

/**
 * Generate formatted WhatsApp message for a RETAIL SINGLE PRODUCT order
 */
export const generateSingleProductWhatsAppMessage = (
  orderId: string,
  customer: CustomerDetails,
  singleOrder: SingleProductOrder
): string => {
  const { product, quantity, unitPrice, cartType } = singleOrder;
  const lineTotal = unitPrice * quantity;
  const subtotal = lineTotal;
  const gst = Math.round(subtotal * 0.03);
  const shipping = 0; // No shipping fee
  const grandTotal = subtotal + gst;

  let msg = `Hello Sai Balaji Silver Works,\n\n`;
  msg += `I would like to place a RETAIL order.\n\n`;
  msg += `Order ID: ${orderId}\n\n`;

  msg += `CUSTOMER DETAILS\n`;
  msg += `━━━━━━━━━━━━━━━━\n`;
  msg += `Name: ${customer.name}\n`;
  msg += `Mobile: ${customer.mobile}\n`;
  if (customer.address) msg += `Address: ${customer.address}\n`;
  if (customer.city) msg += `City: ${customer.city}\n`;
  if (customer.pincode) msg += `Pincode: ${customer.pincode}\n`;
  if (customer.notes) msg += `Notes: ${customer.notes}\n`;

  msg += `\nORDER DETAILS\n`;
  msg += `━━━━━━━━━━━━━━━━\n\n`;
  msg += `Product: ${product.title}\n`;
  msg += `SKU: ${product.sku}\n`;
  msg += `Quantity: ${quantity}\n`;
  msg += `Unit Price: ₹${unitPrice.toLocaleString()}\n`;
  msg += `Total: ₹${lineTotal.toLocaleString()}\n`;

  if (product.category?.name) msg += `Category: ${product.category.name}\n`;
  if (product.subcategory?.name) msg += `Subcategory: ${product.subcategory.name}\n`;

  msg += `\n━━━━━━━━━━━━━━━━\n\n`;
  msg += `Total Items: ${quantity}\n`;
  msg += `Cart Type: ${cartType}\n\n`;
  msg += `Subtotal: ₹${subtotal.toLocaleString()}\n`;
  msg += `GST (3%): ₹${gst.toLocaleString()}\n`;
  msg += `Shipping: FREE\n\n`;
  msg += `GRAND TOTAL: ₹${grandTotal.toLocaleString()}\n\n`;
  msg += `Please confirm availability and order details.\n`;

  if (product.featured_image) {
    msg += `\nProduct Image:\n${product.featured_image}\n`;
  }

  msg += `\nThank you.`;

  return msg;
};

/**
 * Generate formatted WhatsApp message for RETAIL CART order
 */
export const generateFullCartWhatsAppMessage = (
  orderId: string,
  customer: CustomerDetails,
  cartOrder: FullCartOrder
): string => {
  const { items, totalQuantity, cartType, subtotal, tax, grandTotal } = cartOrder;

  let msg = `Hello Sai Balaji Silver Works,\n\n`;
  msg += `I would like to place a RETAIL order.\n\n`;
  msg += `Order ID: ${orderId}\n\n`;

  msg += `CUSTOMER DETAILS\n`;
  msg += `━━━━━━━━━━━━━━━━\n`;
  msg += `Name: ${customer.name}\n`;
  msg += `Mobile: ${customer.mobile}\n`;
  if (customer.address) msg += `Address: ${customer.address}\n`;
  if (customer.city) msg += `City: ${customer.city}\n`;
  if (customer.pincode) msg += `Pincode: ${customer.pincode}\n`;
  if (customer.notes) msg += `Notes: ${customer.notes}\n`;

  msg += `\nORDER DETAILS\n`;
  msg += `━━━━━━━━━━━━━━━━\n\n`;

  items.forEach((item, index) => {
    msg += `${index + 1}. ${item.product.title}\n`;
    msg += `SKU: ${item.product.sku}\n`;
    msg += `Qty: ${item.quantity}\n`;
    msg += `Unit Price: ₹${item.effectivePrice.toLocaleString()}\n`;
    msg += `Total: ₹${item.itemSubtotal.toLocaleString()}\n`;
    if (item.product.featured_image) {
      msg += `Image: ${item.product.featured_image}\n`;
    }
    msg += `\n`;
  });

  msg += `━━━━━━━━━━━━━━━━\n\n`;
  msg += `Total Items: ${totalQuantity}\n`;
  msg += `Cart Type: ${cartType}\n\n`;
  msg += `Subtotal: ₹${subtotal.toLocaleString()}\n`;
  msg += `GST (3%): ₹${tax.toLocaleString()}\n`;
  msg += `Shipping: FREE\n\n`;
  msg += `GRAND TOTAL: ₹${grandTotal.toLocaleString()}\n\n`;
  msg += `Please confirm availability and order details.\n\n`;
  msg += `Thank you.`;

  return msg;
};

/**
 * Open WhatsApp Click-to-Chat in new tab/app using standard wa.me format
 */
export const openWhatsAppOrderUrl = (rawMessage: string): void => {
  const encodedText = encodeURIComponent(rawMessage);
  const whatsappUrl = `https://wa.me/${ADMIN_WHATSAPP_NUMBER}?text=${encodedText}`;
  window.open(whatsappUrl, '_blank');
};
