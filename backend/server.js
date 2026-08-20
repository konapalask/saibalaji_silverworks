const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 8000;
const JWT_SECRET = process.env.JWT_SECRET || 'saibalaji_silverworks_super_secret_jwt_key_2026';

// Middleware
app.use(cors());
app.use(express.json());

// Serve static images from /public directory
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}
app.use('/public', express.static(publicDir));

// Utility Functions to Load JSON Data
const loadJsonFile = (filename, defaultValue = []) => {
  const filePath = path.join(__dirname, filename);
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error(`Error reading ${filename}:`, err);
  }
  return defaultValue;
};

const saveJsonFile = (filename, data) => {
  const filePath = path.join(__dirname, filename);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error(`Error writing ${filename}:`, err);
  }
};

// Data Helper Functions (Always load LIVE directly from JSON files on disk)
const getCategories = () => loadJsonFile('categories_data.json', []);
const getProducts = () => loadJsonFile('products_data.json', []);
const getUsers = () => loadJsonFile('users.json', []);
const getOrders = () => loadJsonFile('orders_data.json', []);
const getWholesaleRequests = () => loadJsonFile('wholesale_requests_data.json', []);
const getQuotations = () => loadJsonFile('quotations_data.json', []);
const getWishlists = () => loadJsonFile('wishlists_data.json', []);
let homepageHero = loadJsonFile('homepage_hero_data.json', {
  title: 'Crafted in Silver. Created with Precision.',
  content: 'From traditional craftsmanship to contemporary silver designs, Sai Balaji Silverworks creates premium silver products for retail and wholesale markets.',
  media_url: '/hero_balaji_4k.png'
});
let videos = loadJsonFile('videos_data.json', []);

// JWT Verification Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ detail: 'Authentication token missing' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ detail: 'Invalid or expired token' });
    req.user = user;
    next();
  });
};

// Admin Verification Middleware
const requireAdmin = (req, res, next) => {
  authenticateToken(req, res, () => {
    if (req.user && (req.user.role === 'ADMIN' || req.user.role === 'SUPER_ADMIN')) {
      next();
    } else {
      res.status(403).json({ detail: 'Access denied. Admin privileges required.' });
    }
  });
};

// --- AUTH API ENDPOINTS ---

const getUsers = () => loadJsonFile('users.json', []);

// Register New User
app.post('/api/v1/auth/register', (req, res) => {
  users = getUsers();
  const { email, password, full_name, phone, company_name, gstin, street_address, city, state, pincode } = req.body;
  if (!email || !password) {
    return res.status(400).json({ detail: 'Email and password are required' });
  }
  if (!full_name || !phone || !street_address || !city || !pincode) {
    return res.status(400).json({ detail: 'Full name, phone, street address, city, and pincode are required for account creation.' });
  }

  const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ detail: 'Email is already registered' });
  }

  const newUser = {
    id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
    email: email.toLowerCase(),
    password_hash: bcrypt.hashSync(password, 10),
    full_name: full_name || email.split('@')[0],
    phone: phone || '',
    street_address: street_address || '',
    city: city || '',
    state: state || '',
    pincode: pincode || '',
    company_name: company_name || '',
    gstin: gstin || '',
    role: 'CUSTOMER',
    is_active: true,
    created_at: new Date().toISOString()
  };

  users.push(newUser);
  saveJsonFile('users.json', users);

  const token = jwt.sign({ id: newUser.id, email: newUser.email, role: newUser.role }, JWT_SECRET, { expiresIn: '7d' });
  const { password_hash, ...userResponse } = newUser;
  res.status(201).json({ access_token: token, token_type: 'bearer', user: userResponse });
});

// Google Login / Register
app.post('/api/v1/auth/google', (req, res) => {
  users = getUsers();
  const { idToken, firebase_uid, email, full_name, photo_url } = req.body;

  let verifiedEmail = email;
  let verifiedUid = firebase_uid;
  let verifiedName = full_name;
  let verifiedPhoto = photo_url;

  if (idToken) {
    try {
      const decoded = jwt.decode(idToken);
      if (decoded) {
        if (decoded.email) verifiedEmail = decoded.email;
        if (decoded.user_id || decoded.sub) verifiedUid = decoded.user_id || decoded.sub;
        if (decoded.name && !verifiedName) verifiedName = decoded.name;
        if (decoded.picture && !verifiedPhoto) verifiedPhoto = decoded.picture;
      }
    } catch (err) {
      console.warn('ID Token decode warning:', err.message);
    }
  }

  if (!verifiedEmail) {
    return res.status(400).json({ detail: 'Authenticated Google email is required' });
  }

  verifiedEmail = verifiedEmail.toLowerCase();

  // Search existing user by firebase_uid or email
  let user = users.find(u => 
    (verifiedUid && u.firebase_uid === verifiedUid) || 
    (u.email && u.email.toLowerCase() === verifiedEmail)
  );

  let updated = false;
  if (user) {
    if (verifiedUid && !user.firebase_uid) {
      user.firebase_uid = verifiedUid;
      updated = true;
    }
    if (verifiedPhoto && !user.photo_url) {
      user.photo_url = verifiedPhoto;
      updated = true;
    }
    if (verifiedName && (!user.full_name || user.full_name === 'CUSTOMER')) {
      user.full_name = verifiedName;
      updated = true;
    }
    if (updated) {
      saveJsonFile('users.json', users);
    }
  } else {
    user = {
      id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
      firebase_uid: verifiedUid || '',
      email: verifiedEmail,
      password_hash: '',
      full_name: verifiedName || verifiedEmail.split('@')[0],
      photo_url: verifiedPhoto || '',
      phone: '',
      street_address: '',
      city: '',
      state: '',
      pincode: '',
      company_name: '',
      gstin: '',
      role: 'CUSTOMER',
      is_active: true,
      created_at: new Date().toISOString()
    };
    users.push(user);
    saveJsonFile('users.json', users);
  }

  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  const { password_hash, ...userResponse } = user;
  res.json({ access_token: token, token_type: 'bearer', user: userResponse });
});

// Login User
app.post('/api/v1/auth/login', (req, res) => {
  users = getUsers();
  const { email, username, password } = req.body;
  const userEmail = (email || username || '').toLowerCase();

  const user = users.find(u => u.email.toLowerCase() === userEmail);
  if (!user) {
    return res.status(401).json({ detail: 'Invalid email or password' });
  }

  // Check password strictly against bcrypt hash
  const isMatch = user.password_hash && bcrypt.compareSync(password, user.password_hash);

  if (!isMatch) {
    return res.status(401).json({ detail: 'Invalid email or password' });
  }

  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  const { password_hash, ...userResponse } = user;
  res.json({ access_token: token, token_type: 'bearer', user: userResponse });
});

// Get Current User Profile
app.get('/api/v1/auth/me', authenticateToken, (req, res) => {
  users = getUsers();
  const user = users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ detail: 'User not found' });
  const { password_hash, ...userResponse } = user;
  res.json(userResponse);
});

// Update Current User Profile & Address (Saves directly to users.json)
app.put('/api/v1/auth/me', authenticateToken, (req, res) => {
  users = getUsers();
  const userIndex = users.findIndex(u => u.id === req.user.id);
  if (userIndex === -1) return res.status(404).json({ detail: 'User not found' });

  const { full_name, phone, company_name, gstin, street_address, city, state, pincode } = req.body;

  if (full_name !== undefined) users[userIndex].full_name = full_name;
  if (phone !== undefined) users[userIndex].phone = phone;
  if (company_name !== undefined) users[userIndex].company_name = company_name;
  if (gstin !== undefined) users[userIndex].gstin = gstin;
  if (street_address !== undefined) users[userIndex].street_address = street_address;
  if (city !== undefined) users[userIndex].city = city;
  if (state !== undefined) users[userIndex].state = state;
  if (pincode !== undefined) users[userIndex].pincode = pincode;

  saveJsonFile('users.json', users);

  const { password_hash, ...userResponse } = users[userIndex];
  res.json(userResponse);
});

// --- USER MANAGEMENT ENDPOINTS ---

// Get All Users (Strictly for Admin)
app.get('/api/v1/users', requireAdmin, (req, res) => {
  users = getUsers();
  const sanitizedUsers = users.map(u => {
    const { password_hash, ...rest } = u;
    return rest;
  });
  res.json(sanitizedUsers);
});

// Delete User (Strictly for Admin)
app.delete('/api/v1/users/:id', requireAdmin, (req, res) => {
  users = getUsers();
  const userId = parseInt(req.params.id);
  users = users.filter(u => u.id !== userId);
  saveJsonFile('users.json', users);
  res.json({ message: 'User deleted successfully' });
});


// --- CATEGORY API ENDPOINTS ---

app.get('/api/v1/categories', (req, res) => {
  res.json(getCategories());
});

app.get('/api/v1/categories/:id_or_slug', (req, res) => {
  const categoriesList = getCategories();
  const productsList = getProducts();
  const param = req.params.id_or_slug;
  const category = categoriesList.find(c => String(c.id) === param || c.slug === param);
  if (!category) return res.status(404).json({ detail: 'Category not found' });

  // Compute subcategories under this category
  const catProducts = productsList.filter(p => p.category_id === category.id || p.category_slug === category.slug);
  const subcategoriesSet = new Set();
  catProducts.forEach(p => { if (p.subcategory) subcategoriesSet.add(p.subcategory); });

  res.json({
    ...category,
    subcategories: Array.from(subcategoriesSet)
  });
});


// --- PRODUCT API ENDPOINTS ---

app.get('/api/v1/products', (req, res) => {
  const productsList = getProducts();
  const categoriesList = getCategories();
  let result = [...productsList];

  // Category Filter
  if (req.query.category_id) {
    result = result.filter(p => p.category_id === parseInt(req.query.category_id));
  }
  if (req.query.category_slug) {
    const slug = req.query.category_slug.toLowerCase();
    result = result.filter(p => p.category_slug && p.category_slug.toLowerCase() === slug);
  }

  // Subcategory Filter
  let sub_list = [];
  if (req.query.subcategories) {
    sub_list = Array.isArray(req.query.subcategories) ? req.query.subcategories : [req.query.subcategories];
  }
  if (req.query.subcategory) {
    const subs = String(req.query.subcategory).split(',').map(s => s.trim()).filter(Boolean);
    subs.forEach(s => { if (!sub_list.includes(s)) sub_list.push(s); });
  }
  if (sub_list.length > 0) {
    result = result.filter(p => p.subcategory && sub_list.includes(p.subcategory));
  }

  // Search Filter
  if (req.query.search) {
    const term = req.query.search.toLowerCase();
    result = result.filter(p =>
      (p.title && p.title.toLowerCase().includes(term)) ||
      (p.sku && p.sku.toLowerCase().includes(term)) ||
      (p.description && p.description.toLowerCase().includes(term)) ||
      (p.subcategory && p.subcategory.toLowerCase().includes(term))
    );
  }

  // Purity Filter
  if (req.query.purity) {
    const purityTerm = req.query.purity.toLowerCase();
    result = result.filter(p => p.silver_purity && p.silver_purity.toLowerCase().includes(purityTerm));
  }

  // Price Limits
  if (req.query.min_price) {
    result = result.filter(p => p.retail_price >= parseFloat(req.query.min_price));
  }
  if (req.query.max_price) {
    result = result.filter(p => p.retail_price <= parseFloat(req.query.max_price));
  }

  // Weight Limits
  if (req.query.min_weight) {
    result = result.filter(p => p.weight_g >= parseFloat(req.query.min_weight));
  }
  if (req.query.max_weight) {
    result = result.filter(p => p.weight_g <= parseFloat(req.query.max_weight));
  }

  // Boolean Flags
  if (req.query.is_featured !== undefined) {
    const isFeat = String(req.query.is_featured) === 'true';
    result = result.filter(p => p.is_featured === isFeat);
  }
  if (req.query.is_new_arrival !== undefined) {
    const isNew = String(req.query.is_new_arrival) === 'true';
    result = result.filter(p => p.is_new_arrival === isNew);
  }
  if (req.query.in_stock !== undefined) {
    const inStock = String(req.query.in_stock) === 'true';
    result = result.filter(p => inStock ? p.stock > 0 : p.stock <= 0);
  }

  // Sorting
  const sortBy = req.query.sort_by || 'featured';
  if (sortBy === 'price_asc' || sortBy === 'price-low-high') {
    result.sort((a, b) => a.retail_price - b.retail_price);
  } else if (sortBy === 'price_desc' || sortBy === 'price-high-low') {
    result.sort((a, b) => b.retail_price - a.retail_price);
  } else if (sortBy === 'weight_asc' || sortBy === 'weight-low-high') {
    result.sort((a, b) => a.weight_g - b.weight_g);
  } else if (sortBy === 'weight_desc' || sortBy === 'weight-high-low') {
    result.sort((a, b) => b.weight_g - a.weight_g);
  } else if (sortBy === 'newest') {
    result.sort((a, b) => b.id - a.id);
  } else { // default "featured"
    result.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
  }

  // Pagination
  const skip = parseInt(req.query.skip) || 0;
  const limit = parseInt(req.query.limit) || 100;
  const paginatedResult = result.slice(skip, skip + limit);

  // Attach category object to each product matching FastAPI schema
  const responseData = paginatedResult.map(p => {
    const cat = categoriesList.find(c => c.id === p.category_id || c.slug === p.category_slug);
    return {
      ...p,
      category: cat || null,
      images: p.images || []
    };
  });

  res.json(responseData);
});

app.get('/api/v1/products/:id_or_slug', (req, res) => {
  const productsList = getProducts();
  const categoriesList = getCategories();
  const param = req.params.id_or_slug;
  const product = productsList.find(p => String(p.id) === param || p.slug === param);
  if (!product) return res.status(404).json({ detail: 'Product not found' });

  const cat = categoriesList.find(c => c.id === product.category_id || c.slug === product.category_slug);
  res.json({
    ...product,
    category: cat || null,
    images: product.images || []
  });
});


// --- ADMIN DASHBOARD & ANALYTICS ---

app.get('/api/v1/dashboard/analytics', requireAdmin, (req, res) => {
  const totalRevenue = orders.reduce((sum, o) => sum + (o.grand_total || o.total_amount || 0), 0);
  const pendingOrders = orders.filter(o => o.status === 'PENDING').length;

  res.json({
    total_revenue: totalRevenue,
    retail_orders_count: orders.length,
    wholesale_requests_count: wholesaleRequests.length,
    pending_orders_count: pendingOrders,
    total_products_count: products.length,
    total_customers_count: users.filter(u => u.role !== 'ADMIN').length,
    recent_orders: orders.slice(-5).reverse(),
    recent_wholesale: wholesaleRequests.slice(-5).reverse()
  });
});


// --- ORDER & FULFILLMENT ENDPOINTS ---

// Admin view all orders
app.get('/api/v1/orders', requireAdmin, (req, res) => {
  orders = loadJsonFile('orders_data.json', []);
  res.json(orders);
});

// Get User Order History (Customer view own orders)
app.get('/api/v1/orders/my-orders', authenticateToken, (req, res) => {
  orders = loadJsonFile('orders_data.json', []);
  users = getUsers();
  const currentUser = users.find(u => u.id === req.user.id);
  const userEmail = (currentUser?.email || req.user.email || '').toLowerCase();
  const userPhone = currentUser?.phone ? currentUser.phone.replace(/\D/g, '') : '';

  const userOrders = orders.filter(o => {
    if (o.user_id && o.user_id === req.user.id) return true;
    if (o.customer_email && o.customer_email.toLowerCase() === userEmail) return true;
    if (userPhone && o.customer_phone && o.customer_phone.replace(/\D/g, '').includes(userPhone)) return true;
    return false;
  });

  res.json(userOrders.reverse());
});

app.post('/api/v1/orders', (req, res) => {
  orders = loadJsonFile('orders_data.json', []);
  const orderData = req.body;

  if (!orderData || ((!orderData.items || orderData.items.length === 0) && (!orderData.grand_total && !orderData.total_amount))) {
    return res.status(400).json({ detail: 'Order payload cannot be empty and must contain items.' });
  }

  users = getUsers();
  let boundUserId = orderData.user_id || null;
  let loggedInUser = null;
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      if (decoded && decoded.id) {
        boundUserId = decoded.id;
        loggedInUser = users.find(u => u.id === decoded.id);
      }
    } catch (e) {}
  }

  const newOrder = {
    id: orders.length > 0 ? Math.max(...orders.map(o => o.id)) + 1 : 1,
    order_number: orderData.order_number || `SBS-ORD-${Date.now().toString().slice(-6)}`,
    user_id: boundUserId,
    customer_name: orderData.customer_name || loggedInUser?.full_name || 'Retail Customer',
    customer_email: orderData.customer_email || orderData.email || loggedInUser?.email || '',
    customer_phone: orderData.customer_phone || orderData.mobile || orderData.phone || loggedInUser?.phone || '',
    shipping_address: orderData.shipping_address || loggedInUser?.street_address || '',
    shipping_city: orderData.shipping_city || loggedInUser?.city || '',
    shipping_state: orderData.shipping_state || loggedInUser?.state || '',
    shipping_pincode: orderData.shipping_pincode || loggedInUser?.pincode || '',
    items: orderData.items || [],
    subtotal: orderData.subtotal || 0,
    tax_amount: orderData.tax_amount ?? orderData.tax ?? 0,
    shipping_charge: orderData.shipping_charge ?? orderData.shipping ?? 0,
    grand_total: orderData.grand_total ?? orderData.total_amount ?? 0,
    status: orderData.status || 'Order Placed',
    created_at: new Date().toISOString()
  };
  orders.push(newOrder);
  saveJsonFile('orders_data.json', orders);
  res.status(201).json(newOrder);
});

app.put('/api/v1/orders/:id/status', requireAdmin, (req, res) => {
  orders = loadJsonFile('orders_data.json', []);
  const orderId = parseInt(req.params.id);
  const { status } = req.body;
  const order = orders.find(o => o.id === orderId);
  if (order) {
    order.status = status;
    saveJsonFile('orders_data.json', orders);
    return res.json(order);
  }
  res.status(404).json({ detail: 'Order not found' });
});


// --- REAL-TIME WISHLIST ENDPOINTS ---

let wishlistsData = loadJsonFile('wishlists_data.json', []);

const getWishlistForUser = (userId) => {
  const wishlistsData = loadJsonFile('wishlists_data.json', []);
  const key = userId || 'guest';
  let userWishlist = wishlistsData.find(w => String(w.user_id) === String(key));
  if (!userWishlist) {
    userWishlist = { user_id: typeof key === 'number' ? key : (isNaN(Number(key)) ? key : Number(key)), product_ids: [], updated_at: new Date().toISOString() };
  }
  return userWishlist;
};

const saveWishlistForUser = (userId, productIds) => {
  const wishlistsData = loadJsonFile('wishlists_data.json', []);
  const cleanIds = Array.from(new Set(productIds.map(Number))).filter(id => !isNaN(id) && id > 0);
  const key = userId || 'guest';
  const existingIdx = wishlistsData.findIndex(w => String(w.user_id) === String(key));
  const updatedWishlist = {
    user_id: typeof key === 'number' ? key : (isNaN(Number(key)) ? key : Number(key)),
    product_ids: cleanIds,
    updated_at: new Date().toISOString()
  };
  if (existingIdx >= 0) {
    wishlistsData[existingIdx] = updatedWishlist;
  } else {
    wishlistsData.push(updatedWishlist);
  }
  saveJsonFile('wishlists_data.json', wishlistsData);
  return updatedWishlist;
};

// GET /api/v1/wishlist
app.get('/api/v1/wishlist', (req, res) => {
  const productsList = getProducts();
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  let userId = null;

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      if (decoded && decoded.id) userId = decoded.id;
    } catch (e) {}
  }

  const targetUserKey = userId || 'guest';
  const userWishlist = getWishlistForUser(targetUserKey);
  const matchedProducts = productsList.filter(p => userWishlist.product_ids.includes(p.id));

  res.json({
    success: true,
    user_id: targetUserKey,
    wishlist_ids: userWishlist.product_ids,
    products: matchedProducts,
    count: userWishlist.product_ids.length,
    updated_at: userWishlist.updated_at
  });
});

// POST /api/v1/wishlist/toggle
app.post('/api/v1/wishlist/toggle', (req, res) => {
  const productsList = getProducts();
  const productId = Number(req.body.product_id || req.body.productId);
  if (!productId || isNaN(productId)) {
    return res.status(400).json({ detail: 'Valid product_id is required' });
  }

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  let userId = null;

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      if (decoded && decoded.id) userId = decoded.id;
    } catch (e) {}
  }

  const targetUserKey = userId || 'guest';
  const currentWishlist = getWishlistForUser(targetUserKey);
  let updatedIds = [...currentWishlist.product_ids];
  const isInList = updatedIds.includes(productId);

  if (isInList) {
    updatedIds = updatedIds.filter(id => id !== productId);
  } else {
    updatedIds.push(productId);
  }

  const saved = saveWishlistForUser(targetUserKey, updatedIds);
  const matchedProducts = productsList.filter(p => saved.product_ids.includes(p.id));

  res.json({
    success: true,
    message: isInList ? 'Removed from wishlist' : 'Added to wishlist',
    is_in_wishlist: !isInList,
    wishlist_ids: saved.product_ids,
    products: matchedProducts,
    count: saved.product_ids.length,
    updated_at: saved.updated_at
  });
});

// GET & POST /api/v1/wishlist/sync
app.get('/api/v1/wishlist/sync', (req, res) => {
  const productsList = getProducts();
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  let userId = null;

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      if (decoded && decoded.id) userId = decoded.id;
    } catch (e) {}
  }

  if (userId) {
    const userWishlist = getWishlistForUser(userId);
    const matchedProducts = productsList.filter(p => userWishlist.product_ids.includes(p.id));
    return res.json({
      success: true,
      user_id: userId,
      wishlist_ids: userWishlist.product_ids,
      products: matchedProducts,
      message: 'Wishlist endpoint active. Use POST to sync local product_ids.'
    });
  }

  res.json({
    success: true,
    message: 'Wishlist sync endpoint active. Send POST with product_ids to sync, or GET /api/v1/wishlist to retrieve items.'
  });
});

app.post('/api/v1/wishlist/sync', (req, res) => {
  const productsList = getProducts();
  const localIds = Array.isArray(req.body.product_ids) ? req.body.product_ids.map(Number).filter(n => !isNaN(n)) : [];

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  let userId = null;

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      if (decoded && decoded.id) userId = decoded.id;
    } catch (e) {}
  }

  if (!userId) {
    const matchedProducts = productsList.filter(p => localIds.includes(p.id));
    return res.json({
      success: true,
      message: 'Guest wishlist synced locally',
      wishlist_ids: localIds,
      products: matchedProducts,
      count: localIds.length
    });
  }

  const currentWishlist = getWishlistForUser(userId);
  const mergedIds = Array.from(new Set([...currentWishlist.product_ids, ...localIds])).filter(n => !isNaN(n));
  const saved = saveWishlistForUser(userId, mergedIds);
  const matchedProducts = productsList.filter(p => saved.product_ids.includes(p.id));

  res.json({
    success: true,
    message: 'Wishlist synced successfully',
    wishlist_ids: saved.product_ids,
    products: matchedProducts,
    count: saved.product_ids.length,
    updated_at: saved.updated_at
  });
});


// --- WHOLESALE & QUOTATION ENDPOINTS ---

// Admin view all wholesale requests
app.get('/api/v1/wholesale/requests', requireAdmin, (req, res) => {
  wholesaleRequests = loadJsonFile('wholesale_requests_data.json', []);
  res.json(wholesaleRequests);
});

app.get('/api/v1/wholesale/my-requests', authenticateToken, (req, res) => {
  wholesaleRequests = loadJsonFile('wholesale_requests_data.json', []);
  users = getUsers();
  const currentUser = users.find(u => u.id === req.user.id);
  const userEmail = (currentUser?.email || req.user.email || '').toLowerCase();
  const userPhone = currentUser?.phone ? currentUser.phone.replace(/\D/g, '') : '';

  const userRequests = wholesaleRequests.filter(r => {
    if (r.user_id && r.user_id === req.user.id) return true;
    if (r.email && r.email.toLowerCase() === userEmail) return true;
    if (userPhone && r.phone && r.phone.replace(/\D/g, '').includes(userPhone)) return true;
    return false;
  });

  res.json(userRequests.reverse());
});

app.post(['/api/v1/wholesale/requests', '/api/v1/wholesale/quote'], (req, res) => {
  wholesaleRequests = loadJsonFile('wholesale_requests_data.json', []);
  const reqData = req.body;
  let boundUserId = reqData.user_id || null;
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      if (decoded && decoded.id) {
        boundUserId = decoded.id;
      }
    } catch (e) {}
  }

  const newReq = {
    id: wholesaleRequests.length > 0 ? Math.max(...wholesaleRequests.map(r => r.id)) + 1 : 1,
    request_number: reqData.request_number || `SBS-QT-${Date.now().toString().slice(-6)}`,
    user_id: boundUserId,
    company_name: reqData.company_name || '',
    contact_person: reqData.contact_person || '',
    phone: reqData.phone || '',
    email: reqData.email || '',
    gstin: reqData.gstin || '',
    address: reqData.address || '',
    city: reqData.city || '',
    state: reqData.state || '',
    pincode: reqData.pincode || '',
    items: reqData.items || [],
    status: 'PENDING',
    created_at: new Date().toISOString()
  };
  wholesaleRequests.push(newReq);
  saveJsonFile('wholesale_requests_data.json', wholesaleRequests);
  res.status(201).json({
    message: 'Wholesale quotation request submitted successfully!',
    request_number: newReq.request_number,
    quote_id: newReq.request_number,
    data: newReq,
    ...newReq
  });
});

app.get('/api/v1/quotations/all', (req, res) => {
  res.json(quotations);
});

app.post('/api/v1/quotations', requireAdmin, (req, res) => {
  const quoteData = req.body;
  const newQuote = {
    id: quotations.length + 1,
    quote_number: `SB-QT-${Date.now().toString().slice(-6)}`,
    ...quoteData,
    created_at: new Date().toISOString()
  };
  quotations.push(newQuote);
  saveJsonFile('quotations_data.json', quotations);
  res.status(201).json(newQuote);
});


// --- CMS & EDITORIAL ENDPOINTS ---

app.get('/api/v1/content/homepage_hero', (req, res) => {
  res.json(homepageHero);
});

app.put(['/api/v1/content/homepage_hero', '/api/v1/content/admin/homepage_hero'], requireAdmin, (req, res) => {
  homepageHero = { ...homepageHero, ...req.body };
  saveJsonFile('homepage_hero_data.json', homepageHero);
  res.json(homepageHero);
});

app.get('/api/v1/content/videos/all', (req, res) => {
  res.json(videos);
});

app.post('/api/v1/content/videos', requireAdmin, (req, res) => {
  const newVideo = {
    id: videos.length + 1,
    ...req.body,
    created_at: new Date().toISOString()
  };
  videos.push(newVideo);
  saveJsonFile('videos_data.json', videos);
  res.status(201).json(newVideo);
});

app.delete('/api/v1/content/videos/:id', requireAdmin, (req, res) => {
  const vidId = parseInt(req.params.id);
  videos = videos.filter(v => v.id !== vidId);
  saveJsonFile('videos_data.json', videos);
  res.json({ message: 'Video deleted' });
});


// --- INTERACTIVE SWAGGER / API DOCS UI ---

app.get(['/docs', '/api/v1/docs'], (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Sai Balaji Silverworks - Node.js API Docs</title>
      <link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.18.3/swagger-ui.css" />
      <style>html { box-sizing: border-box; overflow-y: scroll; } *, *:before, *:after { box-sizing: inherit; } body { margin:0; background: #fafafa; }</style>
    </head>
    <body>
      <div id="swagger-ui"></div>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.18.3/swagger-ui-bundle.js"></script>
      <script>
        window.onload = function() {
          window.ui = SwaggerUIBundle({
            url: "/openapi.json",
            dom_id: '#swagger-ui',
            deepLinking: true,
            presets: [SwaggerUIBundle.presets.apis]
          });
        };
      </script>
    </body>
    </html>
  `);
});

app.get('/openapi.json', (req, res) => {
  res.json({
    openapi: "3.0.2",
    info: {
      title: "Sai Balaji Silverworks API",
      version: "1.0.0",
      description: "Complete Express.js API specification for Sai Balaji Silverworks backend."
    },
    paths: {
      "/api/v1/products": {
        get: {
          summary: "Get all products with filtering & sorting",
          tags: ["Products"],
          parameters: [
            { name: "category_id", in: "query", schema: { type: "integer" }, description: "Filter by Category ID" },
            { name: "category_slug", in: "query", schema: { type: "string" }, description: "Filter by Category Slug" },
            { name: "subcategory", in: "query", schema: { type: "string" }, description: "Filter by Subcategory name" },
            { name: "search", in: "query", schema: { type: "string" }, description: "Search by title, SKU, or description" },
            { name: "purity", in: "query", schema: { type: "string" }, description: "Filter by Silver Purity (e.g. 92.5%, 99.9%)" },
            { name: "min_price", in: "query", schema: { type: "number" }, description: "Minimum price in INR" },
            { name: "max_price", in: "query", schema: { type: "number" }, description: "Maximum price in INR" },
            { name: "min_weight", in: "query", schema: { type: "number" }, description: "Minimum weight in grams" },
            { name: "max_weight", in: "query", schema: { type: "number" }, description: "Maximum weight in grams" },
            { name: "is_featured", in: "query", schema: { type: "boolean" }, description: "Filter featured products" },
            { name: "is_new_arrival", in: "query", schema: { type: "boolean" }, description: "Filter new arrivals" },
            { name: "in_stock", in: "query", schema: { type: "boolean" }, description: "Filter in-stock products" },
            { name: "sort_by", in: "query", schema: { type: "string" }, description: "Sort order: price_asc, price_desc, weight_asc, weight_desc, newest, featured" },
            { name: "skip", in: "query", schema: { type: "integer", default: 0 }, description: "Pagination skip offset" },
            { name: "limit", in: "query", schema: { type: "integer", default: 100 }, description: "Pagination limit" }
          ],
          responses: { "200": { description: "List of products" } }
        }
      },
      "/api/v1/products/{id_or_slug}": {
        get: {
          summary: "Get product details by ID or slug",
          tags: ["Products"],
          parameters: [
            { name: "id_or_slug", in: "path", required: true, schema: { type: "string" }, description: "Product ID or URL slug" }
          ],
          responses: { "200": { description: "Product details" }, "404": { description: "Product not found" } }
        }
      },
      "/api/v1/categories": {
        get: {
          summary: "Get all categories",
          tags: ["Categories"],
          responses: { "200": { description: "List of categories" } }
        }
      },
      "/api/v1/categories/{id_or_slug}": {
        get: {
          summary: "Get category details & subcategories",
          tags: ["Categories"],
          parameters: [
            { name: "id_or_slug", in: "path", required: true, schema: { type: "string" }, description: "Category ID or URL slug" }
          ],
          responses: { "200": { description: "Category details with subcategories" }, "404": { description: "Category not found" } }
        }
      },
      "/api/v1/auth/register": {
        post: {
          summary: "User Registration",
          tags: ["Auth"],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["email", "password", "full_name"],
                  properties: {
                    email: { type: "string" },
                    password: { type: "string" },
                    full_name: { type: "string" },
                    phone: { type: "string" },
                    company_name: { type: "string" },
                    gstin: { type: "string" }
                  }
                }
              }
            }
          },
          responses: { "201": { description: "User registered successfully with access token" }, "400": { description: "Validation error or user exists" } }
        }
      },
      "/api/v1/auth/login": {
        post: {
          summary: "User Login",
          tags: ["Auth"],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["email", "password"],
                  properties: {
                    email: { type: "string" },
                    password: { type: "string" }
                  }
                }
              }
            }
          },
          responses: { "200": { description: "Login successful with access token" }, "401": { description: "Invalid credentials" } }
        }
      },
      "/api/v1/auth/me": {
        get: {
          summary: "Get Current User Profile",
          tags: ["Auth"],
          security: [{ BearerAuth: [] }],
          responses: { "200": { description: "Current user profile" }, "401": { description: "Unauthorized / Missing token" } }
        }
      },
      "/api/v1/orders": {
        post: {
          summary: "Create New Order",
          tags: ["Orders"],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    items: { type: "array" },
                    shipping_address: { type: "object" },
                    total_amount: { type: "number" }
                  }
                }
              }
            }
          },
          responses: { "201": { description: "Order created successfully" } }
        }
      },
      "/api/v1/wholesale/quote": {
        post: {
          summary: "Submit Wholesale Quotation Request",
          tags: ["Wholesale"],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    company_name: { type: "string" },
                    contact_person: { type: "string" },
                    phone: { type: "string" },
                    email: { type: "string" },
                    gstin: { type: "string" },
                    requirements: { type: "string" }
                  }
                }
              }
            }
          },
          responses: { "201": { description: "Wholesale quote request submitted" } }
        }
      },
      "/api/v1/users": {
        get: {
          summary: "Get list of registered users and customers (Admin Only)",
          tags: ["Users & Management"],
          security: [{ BearerAuth: [] }],
          responses: { "200": { description: "List of registered users" }, "401": { description: "Missing token" }, "403": { description: "Admin access required" } }
        }
      }
    },
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      }
    }
  });
});

// Start Node.js Express Server
app.listen(PORT, () => {
  console.log(`========================================================`);
  console.log(`  🚀 Node.js Express Server running on http://localhost:${PORT}`);
  console.log(`  📁 Products loaded from JSON: ${products.length} products`);
  console.log(`  📁 Categories loaded from JSON: ${categories.length} categories`);
  console.log(`  📖 Interactive API Docs: http://localhost:${PORT}/docs`);
  console.log(`========================================================`);
});
