const mongoose = require('mongoose');

const VideoSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true, index: true },
  title: { type: String, default: '' },
  description: { type: String, default: '' },
  video_url: { type: String, default: '' },
  thumbnail_url: { type: String, default: '' },
  category: { type: String, default: '' },
  section: { type: String, default: '' },
  filename: { type: String, default: '' },
  sort_order: { type: Number, default: 999 },
  is_active: { type: Boolean, default: true },
  is_portrait: { type: Boolean, default: false },
  size_mb: { type: String, default: '' },
  created_at: { type: String },
  updated_at: { type: String }
}, {
  timestamps: true,
  strict: false
});

module.exports = mongoose.model('Video', VideoSchema);
