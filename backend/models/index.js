const Product = require('./Product');
const Category = require('./Category');
const User = require('./User');
const Order = require('./Order');
const WholesaleRequest = require('./WholesaleRequest');
const Quotation = require('./Quotation');
const Wishlist = require('./Wishlist');
const Video = require('./Video');
const Gallery = require('./Gallery');
const Setting = require('./Setting');
const HomepageHero = require('./HomepageHero');

module.exports = {
  Product,
  Category,
  User,
  Order,
  WholesaleRequest,
  Quotation,
  Wishlist,
  Video,
  Gallery,
  Setting,
  HomepageHero,
  fileModelMap: {
    'products_data.json': Product,
    'categories_data.json': Category,
    'users.json': User,
    'orders_data.json': Order,
    'wholesale_requests_data.json': WholesaleRequest,
    'quotations_data.json': Quotation,
    'wishlists_data.json': Wishlist,
    'videos_data.json': Video,
    'gallery_data.json': Gallery,
    'settings_data.json': Setting,
    'homepage_hero_data.json': HomepageHero
  }
};
