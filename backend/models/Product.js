const mongoose = require('mongoose');

const VariantSchema = new mongoose.Schema({
  id: { type: String },
  measurement: { type: String },
  weight_g: { type: Number },
  making_charge: { type: Number },
  making_charge_type: { type: String, default: 'per_gram' },
  stock: { type: Number, default: 0 },
  sku: { type: String },
  image: { type: String, default: '' },
  is_active: { type: Boolean, default: true }
}, { _id: false, strict: false });

const ProductSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true, index: true },
  title: { type: String, required: true },
  slug: { type: String, index: true },
  sku: { type: String },
  category_id: { type: Number, index: true },
  category_name: { type: String },
  category_slug: { type: String },
  subcategory: { type: String },
  product_type: { type: String, default: 'BOTH' },
  silver_purity: { type: String, default: '925 Sterling Silver' },
  weight_g: { type: Number, default: null },
  retail_price: { type: Number, default: 0 },
  wholesale_price: { type: Number, default: 0 },
  min_wholesale_qty: { type: Number, default: 1 },
  stock: { type: Number, default: 100 },
  description: { type: String, default: '' },
  specifications: { type: String, default: '' },
  featured_image: { type: String, default: '' },
  images: [{ type: String }],
  is_featured: { type: Boolean, default: false },
  is_new_arrival: { type: Boolean, default: true },
  is_active: { type: Boolean, default: true },
  base_price: { type: Number, default: 0 },
  base_silver_rate: { type: Number, default: 0 },
  current_silver_rate: { type: Number, default: 0 },
  current_price: { type: Number, default: 0 },
  last_silver_rate_updated_at: { type: String },
  gross_weight_g: { type: Number, default: null },
  net_silver_weight_g: { type: Number, default: null },
  making_charges: { type: Number, default: null },
  dimensions: { type: String, default: '' },
  variants: [VariantSchema],
  sort_order: { type: Number, default: 999 },
  video_url: { type: String, default: '' },
  video_thumbnail: { type: String, default: '' },
  video_size_mb: { type: String, default: '' },
  created_at: { type: String }
}, {
  timestamps: true,
  strict: false
});

module.exports = mongoose.model('Product', ProductSchema);
