const mongoose = require('mongoose');

const HomepageHeroSchema = new mongoose.Schema({
  title: { type: String, default: 'Crafted in Silver. Created with Precision.' },
  content: { type: String, default: '' },
  media_url: { type: String, default: '/homescreen.webp' }
}, {
  timestamps: true,
  strict: false
});

module.exports = mongoose.model('HomepageHero', HomepageHeroSchema);
