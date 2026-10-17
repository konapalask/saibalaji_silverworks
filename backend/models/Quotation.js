const mongoose = require('mongoose');

const QuotationSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true, index: true },
  quotation_number: { type: String, required: true, index: true },
  quote_number: { type: String },
  wholesale_request_id: { type: mongoose.Schema.Types.Mixed },
  company_name: { type: String, default: '' },
  contact_person: { type: String, default: '' },
  phone: { type: String, default: '' },
  email: { type: String, default: '' },
  gstin: { type: String, default: '' },
  address: { type: String, default: '' },
  items: [{ type: mongoose.Schema.Types.Mixed }],
  subtotal: { type: Number, default: 0 },
  tax_amount: { type: Number, default: 0 },
  grand_total: { type: Number, default: 0 },
  status: { type: String, default: 'DRAFT' },
  created_at: { type: String }
}, {
  timestamps: true,
  strict: false
});

module.exports = mongoose.model('Quotation', QuotationSchema);
