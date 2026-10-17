const mongoose = require('mongoose');

const GallerySchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true, index: true },
  filename: { type: String },
  title: { type: String, default: '' },
  category: { type: String, default: 'Workshop & Atelier' },
  description: { type: String, default: '' },
  image_url: { type: String, default: '' },
  sort_order: { type: Number, default: 999 },
  is_active: { type: Boolean, default: true },
  tags: [{ type: String }],
  created_at: { type: String }
}, {
  timestamps: true,
  strict: false
});

module.exports = mongoose.model('Gallery', GallerySchema);
