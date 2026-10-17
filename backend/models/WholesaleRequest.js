const mongoose = require('mongoose');

const WholesaleRequestSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true, index: true },
  request_number: { type: String, required: true, index: true },
  user_id: { type: mongoose.Schema.Types.Mixed, index: true },
  company_name: { type: String, default: '' },
  contact_person: { type: String, default: '' },
  phone: { type: String, default: '' },
  email: { type: String, default: '' },
  gstin: { type: String, default: '' },
  address: { type: String, default: '' },
  city: { type: String, default: '' },
  state: { type: String, default: '' },
  pincode: { type: String, default: '' },
  items: [{ type: mongoose.Schema.Types.Mixed }],
  status: { type: String, default: 'PENDING' },
  created_at: { type: String }
}, {
  timestamps: true,
  strict: false
});

module.exports = mongoose.model('WholesaleRequest', WholesaleRequestSchema);
