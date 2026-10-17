const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true, index: true },
  name: { type: String, required: true },
  slug: { type: String, required: true, index: true },
  description: { type: String, default: '' },
  image_url: { type: String, default: '' },
  is_featured: { type: Boolean, default: false },
  subcategories: [{
    id: { type: String },
    name: { type: String },
    slug: { type: String }
  }]
}, {
  timestamps: true,
  strict: false
});

module.exports = mongoose.model('Category', CategorySchema);
