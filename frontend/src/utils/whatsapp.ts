import { ADMIN_WHATSAPP_NUMBER } from '../config/whatsappConfig';

export const STORE_WHATSAPP_NUMBER = ADMIN_WHATSAPP_NUMBER;

export const generateWhatsAppOrderMessage = (order: any) => {
  const itemsText = (order.items || [])
    .map((item: any) => `• ${item.product_name || 'Silver Item'} (Qty: ${item.quantity} × ₹${(item.unit_price || 0).toLocaleString()})`)
    .join('\n');

  const text = `🛍️ *NEW RETAIL ORDER - SAI BALAJI SILVERWORKS*\n` +
    `----------------------------------------\n` +
    `📋 *Order ID:* ${order.order_number || order.id || 'N/A'}\n` +
    `👤 *Customer Name:* ${order.customer_name || 'Customer'}\n` +
    `📞 *Customer Phone:* ${order.customer_phone || 'N/A'}\n` +
    `----------------------------------------\n` +
    `📦 *ITEMS ORDERED:*\n${itemsText || '1x Handcrafted Silver Creation'}\n` +
    `----------------------------------------\n` +
    `💰 *Grand Total:* ₹${(order.grand_total || 0).toLocaleString()}\n` +
    `----------------------------------------\n` +
    `Please confirm my retail order. Thank you!`;

  return encodeURIComponent(text);
};

export const openWhatsAppOrderMessage = (order: any) => {
  if (!order) return;
  const encodedText = generateWhatsAppOrderMessage(order);
  const whatsappUrl = `https://wa.me/${ADMIN_WHATSAPP_NUMBER}?text=${encodedText}`;
  window.open(whatsappUrl, '_blank');
};
