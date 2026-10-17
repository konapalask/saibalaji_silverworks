const mongoose = require('mongoose');

const WishlistSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.Mixed, required: true, index: true },
  product_ids: [{ type: mongoose.Schema.Types.Mixed }],
  updated_at: { type: String }
}, {
  timestamps: true,
  strict: false
});

module.exports = mongoose.model('Wishlist', WishlistSchema);
