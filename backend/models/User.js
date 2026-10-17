const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true, index: true },
  email: { type: String, lowercase: true, trim: true, index: true },
  password_hash: { type: String, default: '' },
  full_name: { type: String, default: '' },
  phone: { type: String, index: true, default: '' },
  company_name: { type: String, default: '' },
  gstin: { type: String, default: '' },
  role: { type: String, default: 'CUSTOMER', enum: ['CUSTOMER', 'ADMIN', 'WHOLESALER'] },
  is_active: { type: Boolean, default: true },
  firebase_uid: { type: String, index: true, sparse: true },
  photo_url: { type: String, default: '' },
  street_address: { type: String, default: '' },
  city: { type: String, default: '' },
  state: { type: String, default: '' },
  pincode: { type: String, default: '' },
  created_at: { type: String }
}, {
  timestamps: true,
  strict: false
});

module.exports = mongoose.model('User', UserSchema);
