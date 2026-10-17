const mongoose = require('mongoose');

const SettingSchema = new mongoose.Schema({
  key: { type: String, default: 'global' },
  whatsapp_number: { type: String, default: '919347443997' }
}, {
  timestamps: true,
  strict: false
});

module.exports = mongoose.model('Setting', SettingSchema);
