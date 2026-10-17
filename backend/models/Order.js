const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema({
  id: { type: Number },
  product_id: { type: Number },
  product_name: { type: String },
  product_sku: { type: String },
  measurement: { type: String },
  weight_g: { type: Number },
  unit_price: { type: Number },
  quantity: { type: Number, default: 1 },
  subtotal: { type: Number },
  featured_image: { type: String },
  image_url: { type: String },
  price: { type: Number },
  silver_rate_used: { type: Number },
  making_charge: { type: Number }
}, { _id: false, strict: false });

const OrderSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true, index: true },
  order_number: { type: String, required: true, unique: true, index: true },
  user_id: { type: mongoose.Schema.Types.Mixed, index: true },
  customer_name: { type: String, default: '' },
  customer_email: { type: String, default: '' },
  customer_phone: { type: String, default: '' },
  shipping_address: { type: String, default: '' },
  shipping_city: { type: String, default: '' },
  shipping_state: { type: String, default: '' },
  shipping_pincode: { type: String, default: '' },
  items: [OrderItemSchema],
  subtotal: { type: Number, default: 0 },
  tax_amount: { type: Number, default: 0 },
  shipping_charge: { type: Number, default: 0 },
  grand_total: { type: Number, default: 0 },
  live_silver_rate_applied: { type: Number, default: 0 },
  status: { type: String, default: 'Pending' },
  created_at: { type: String }
}, {
  timestamps: true,
  strict: false
});

module.exports = mongoose.model('Order', OrderSchema);
