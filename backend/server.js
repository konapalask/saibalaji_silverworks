const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const https = require('https');
const http = require('http');

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
  media_url: '/homescreen.webp'
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
  const limit = req.query.limit ? parseInt(req.query.limit) : 500;
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

// Alias GET /api/products
app.get('/api/products', (req, res) => {
  req.url = '/api/v1/products' + (req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : '');
  const productsList = getProducts();
  const categoriesList = getCategories();
  let result = [...productsList];

  if (req.query.category_id) {
    result = result.filter(p => p.category_id === parseInt(req.query.category_id));
  }
  if (req.query.category_slug) {
    const slug = req.query.category_slug.toLowerCase();
    result = result.filter(p => p.category_slug && p.category_slug.toLowerCase() === slug);
  }

  const limit = parseInt(req.query.limit) || 200;
  const paginatedResult = result.slice(0, limit);
  const responseData = paginatedResult.map(p => {
    const cat = categoriesList.find(c => c.id === p.category_id || c.slug === p.category_slug);
    return { ...p, category: cat || null, images: p.images || [] };
  });
  res.json(responseData);
});

app.get('/api/products/:id_or_slug', (req, res) => {
  const productsList = getProducts();
  const categoriesList = getCategories();
  const param = req.params.id_or_slug;
  const product = productsList.find(p => String(p.id) === param || p.slug === param);
  if (!product) return res.status(404).json({ detail: 'Product not found' });

  const cat = categoriesList.find(c => c.id === product.category_id || c.slug === product.category_slug);
  res.json({ ...product, category: cat || null, images: product.images || [] });
});

// Admin Product Create (POST)
const handleCreateProduct = (req, res) => {
  const productsList = getProducts();
  const categoriesList = getCategories();

  const {
    title, sku, category_id, subcategory, product_type, silver_purity,
    weight_g, gross_weight_g, net_silver_weight_g, making_charges, dimensions,
    retail_price, wholesale_price, min_wholesale_qty, stock, description, specifications,
    featured_image, is_featured, is_new_arrival
  } = req.body;

  const category = categoriesList.find(c => c.id === Number(category_id));
  const newId = productsList.length > 0 ? Math.max(...productsList.map(p => p.id)) + 1 : 1;

  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const newProduct = {
    id: newId,
    title: title || 'New Silver Product',
    slug,
    sku: sku || `SBS-SLV-${newId}`,
    category_id: category_id ? Number(category_id) : 1,
    category_name: category ? category.name : 'Silver Pooja Articles',
    category_slug: category ? category.slug : 'silver-pooja-articles',
    subcategory: subcategory || '',
    product_type: product_type || 'BOTH',
    silver_purity: silver_purity || '925 Sterling Silver',
    weight_g: weight_g ? parseFloat(weight_g) : 50.0,
    gross_weight_g: gross_weight_g ? parseFloat(gross_weight_g) : (weight_g ? parseFloat(weight_g) : 50.0),
    net_silver_weight_g: net_silver_weight_g ? parseFloat(net_silver_weight_g) : (weight_g ? parseFloat(weight_g) : 50.0),
    making_charges: making_charges ? parseFloat(making_charges) : 0,
    dimensions: dimensions || '',
    retail_price: retail_price ? parseFloat(retail_price) : 0,
    wholesale_price: wholesale_price ? parseFloat(wholesale_price) : (retail_price ? parseFloat(retail_price) : 0),
    min_wholesale_qty: min_wholesale_qty ? parseInt(min_wholesale_qty) : 5,
    stock: stock !== undefined ? parseInt(stock) : 25,
    description: description || '',
    specifications: specifications || '',
    featured_image: featured_image || '/public/sai balajji products/Floral Engraved Silver Pooja Thali Set.webp',
    is_featured: Boolean(is_featured),
    is_new_arrival: is_new_arrival !== undefined ? Boolean(is_new_arrival) : true,
    is_active: true,
    created_at: new Date().toISOString()
  };

  productsList.push(newProduct);
  saveJsonFile('products_data.json', productsList);
  res.status(201).json(newProduct);
};

app.post('/api/v1/products', requireAdmin, handleCreateProduct);
app.post('/api/products', handleCreateProduct);

// Admin Product Update (PUT)
const handleUpdateProduct = (req, res) => {
  const productsList = getProducts();
  const categoriesList = getCategories();
  const productId = parseInt(req.params.id);

  const index = productsList.findIndex(p => p.id === productId);
  if (index === -1) {
    return res.status(404).json({ detail: 'Product not found' });
  }

  const existing = productsList[index];
  const {
    title, sku, category_id, subcategory, product_type, silver_purity,
    weight_g, gross_weight_g, net_silver_weight_g, making_charges, dimensions,
    retail_price, wholesale_price, min_wholesale_qty, stock, description, specifications,
    featured_image, is_featured, is_new_arrival, is_active
  } = req.body;

  const catId = category_id !== undefined ? Number(category_id) : existing.category_id;
  const category = categoriesList.find(c => c.id === catId);

  const updatedProduct = {
    ...existing,
    title: title !== undefined ? title : existing.title,
    sku: sku !== undefined ? sku : existing.sku,
    category_id: catId,
    category_name: category ? category.name : existing.category_name,
    category_slug: category ? category.slug : existing.category_slug,
    subcategory: subcategory !== undefined ? subcategory : existing.subcategory,
    product_type: product_type !== undefined ? product_type : existing.product_type,
    silver_purity: silver_purity !== undefined ? silver_purity : existing.silver_purity,
    weight_g: weight_g !== undefined ? parseFloat(weight_g) : existing.weight_g,
    gross_weight_g: gross_weight_g !== undefined ? parseFloat(gross_weight_g) : (existing.gross_weight_g || existing.weight_g),
    net_silver_weight_g: net_silver_weight_g !== undefined ? parseFloat(net_silver_weight_g) : (existing.net_silver_weight_g || existing.weight_g),
    making_charges: making_charges !== undefined ? parseFloat(making_charges) : (existing.making_charges || 0),
    dimensions: dimensions !== undefined ? dimensions : (existing.dimensions || ''),
    retail_price: retail_price !== undefined ? parseFloat(retail_price) : existing.retail_price,
    wholesale_price: wholesale_price !== undefined ? parseFloat(wholesale_price) : existing.wholesale_price,
    min_wholesale_qty: min_wholesale_qty !== undefined ? parseInt(min_wholesale_qty) : existing.min_wholesale_qty,
    stock: stock !== undefined ? parseInt(stock) : existing.stock,
    description: description !== undefined ? description : existing.description,
    specifications: specifications !== undefined ? specifications : existing.specifications,
    featured_image: featured_image !== undefined ? featured_image : existing.featured_image,
    is_featured: is_featured !== undefined ? Boolean(is_featured) : existing.is_featured,
    is_new_arrival: is_new_arrival !== undefined ? Boolean(is_new_arrival) : existing.is_new_arrival,
    is_active: is_active !== undefined ? Boolean(is_active) : existing.is_active
  };

  productsList[index] = updatedProduct;
  saveJsonFile('products_data.json', productsList);
  res.json(updatedProduct);
};

app.put('/api/v1/products/:id', requireAdmin, handleUpdateProduct);
app.put('/api/products/:id', handleUpdateProduct);

// Admin Product Delete (DELETE)
const handleDeleteProduct = (req, res) => {
  let productsList = getProducts();
  const productId = parseInt(req.params.id);

  const initialLength = productsList.length;
  productsList = productsList.filter(p => p.id !== productId);

  if (productsList.length === initialLength) {
    return res.status(404).json({ detail: 'Product not found' });
  }

  saveJsonFile('products_data.json', productsList);
  res.json({ message: 'Product deleted successfully' });
};

app.delete('/api/v1/products/:id', requireAdmin, handleDeleteProduct);
app.delete('/api/products/:id', handleDeleteProduct);


// --- LIVE SILVER RATE SERVICE (RB GOLD SPOT API) ---

const RB_GOLD_API_URL = process.env.RB_GOLD_API_URL || 'https://bcast.rbgoldspot.com:7768/VOTSBroadcastStreaming/Services/xml/GetLiveRateByTemplateID/rbgold';

let silverRateCache = {
  live_silver_rate: 250.64,
  previous_silver_rate: 250.64,
  rate_difference: 0.0,
  rate_per_kg: 250641,
  silver_999_rate: 250.64,
  silver_925_rate: 231.84,
  last_updated_at: new Date().toISOString(),
  api_status: 'CONNECTED',
  error_message: null
};

// SSE subscribers list
let sseSubscribers = [];

function broadcastSilverRateUpdate(data) {
  sseSubscribers.forEach(res => {
    try {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    } catch (err) {
      // ignore closed connections
    }
  });
}

function floatVal(val, defaultVal = 0) {
  const n = parseFloat(val);
  return isNaN(n) ? defaultVal : n;
}

// Recalculate currentPrice = basePrice + (currentSilverRate - baseSilverRate) for all 177 products
function updateAllProductPrices(newSilverRate) {
  let productsList = getProducts();
  if (!productsList || productsList.length === 0) return;

  let modified = false;
  productsList = productsList.map(p => {
    const baseP = floatVal(p.base_price !== undefined ? p.base_price : p.retail_price, 2500);
    const baseSR = floatVal(p.base_silver_rate !== undefined ? p.base_silver_rate : 250.64, 250.64);
    
    // Formula: currentPrice = basePrice + (currentSilverRate - baseSilverRate)
    const calculatedPrice = Math.max(1, Math.round((baseP + (newSilverRate - baseSR)) * 100) / 100);

    if (p.current_price !== calculatedPrice || p.current_silver_rate !== newSilverRate || p.base_price === undefined) {
      modified = true;
      return {
        ...p,
        base_price: baseP,
        base_silver_rate: baseSR,
        current_silver_rate: newSilverRate,
        current_price: calculatedPrice,
        retail_price: calculatedPrice,
        last_silver_rate_updated_at: new Date().toISOString()
      };
    }
    return p;
  });

  if (modified) {
    saveJsonFile('products_data.json', productsList);
  }
}

// Function to fetch live rate from RB Gold Spot API
function fetchLiveSilverRate() {
  try {
    const urlObj = new URL(RB_GOLD_API_URL);
    const client = urlObj.protocol === 'https:' ? https : http;

    const req = client.get({
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
      rejectUnauthorized: false,
      timeout: 6000
    }, (res) => {
      let rawData = '';
      res.on('data', chunk => { rawData += chunk; });
      res.on('end', () => {
        try {
          const lines = rawData.trim().split(/\r?\n/);
          let parsedRate = null;
          let rawKgPrice = null;

          for (const line of lines) {
            const parts = line.split('\t').map(p => p.trim()).filter(Boolean);
            if (parts.length >= 3) {
              const name = parts[1] || '';
              if (name.toLowerCase().includes('silver 999')) {
                const numbers = parts.slice(2).map(p => parseFloat(p)).filter(n => !isNaN(n) && n > 1000);
                if (numbers.length > 0) {
                  rawKgPrice = numbers[0];
                  parsedRate = Math.round((rawKgPrice / 1000) * 100) / 100;
                  break;
                }
              }
            }
          }

          if (parsedRate !== null && !isNaN(parsedRate)) {
            if (parsedRate !== silverRateCache.live_silver_rate) {
              silverRateCache.previous_silver_rate = silverRateCache.live_silver_rate;
              silverRateCache.live_silver_rate = parsedRate;
              silverRateCache.rate_difference = Math.round((parsedRate - silverRateCache.previous_silver_rate) * 100) / 100;
            }
            silverRateCache.rate_per_kg = rawKgPrice || (parsedRate * 1000);
            silverRateCache.silver_999_rate = parsedRate;
            silverRateCache.silver_925_rate = Math.round(parsedRate * 0.925 * 100) / 100;
            silverRateCache.last_updated_at = new Date().toISOString();
            silverRateCache.api_status = 'CONNECTED';
            silverRateCache.error_message = null;

            updateAllProductPrices(silverRateCache.live_silver_rate);
            broadcastSilverRateUpdate(silverRateCache);
          }
        } catch (parseErr) {
          console.warn('RB Gold Spot response parse warning:', parseErr.message);
          silverRateCache.api_status = 'RETRYING';
        }
      });
    });

    req.on('error', (err) => {
      console.warn('RB Gold Spot API network fetch warning:', err.message);
      silverRateCache.api_status = 'RETRYING';
      silverRateCache.error_message = err.message;
    });

    req.on('timeout', () => {
      req.destroy();
      silverRateCache.api_status = 'RETRYING';
    });
  } catch (err) {
    console.warn('Live silver rate fetch exception:', err.message);
    silverRateCache.api_status = 'RETRYING';
  }
}

// Background polling interval every 1 second (1000ms real-time live sync)
setInterval(fetchLiveSilverRate, 1000);
fetchLiveSilverRate();

// --- LIVE SILVER RATE ENDPOINTS ---

const getSilverRateResponse = (req, res) => {
  const productsList = getProducts();
  res.json({
    ...silverRateCache,
    total_products_linked: productsList.length
  });
};

app.get('/api/v1/silver-rate', getSilverRateResponse);
app.get('/api/silver-rate', getSilverRateResponse);

// SSE Stream for Real-Time Live Price Updates
app.get('/api/v1/silver-rate/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  res.write(`data: ${JSON.stringify(silverRateCache)}\n\n`);
  sseSubscribers.push(res);

  req.on('close', () => {
    sseSubscribers = sseSubscribers.filter(client => client !== res);
  });
});

// Admin endpoint to manually update/set silver rate baseline or trigger sync
app.post('/api/v1/admin/silver-rate/baseline', (req, res) => {
  const { new_silver_rate } = req.body;
  if (new_silver_rate && !isNaN(parseFloat(new_silver_rate))) {
    const rateVal = parseFloat(new_silver_rate);
    silverRateCache.previous_silver_rate = silverRateCache.live_silver_rate;
    silverRateCache.live_silver_rate = rateVal;
    silverRateCache.rate_difference = Math.round((rateVal - silverRateCache.previous_silver_rate) * 100) / 100;
    silverRateCache.last_updated_at = new Date().toISOString();
    silverRateCache.api_status = 'CONNECTED';

    updateAllProductPrices(rateVal);
    broadcastSilverRateUpdate(silverRateCache);
    return res.json({ message: 'Live silver rate updated successfully', silver_rate: silverRateCache });
  }
  fetchLiveSilverRate();
  res.json({ message: 'Sync triggered', silver_rate: silverRateCache });
});


// --- ADMIN DASHBOARD & ANALYTICS ---

app.get('/api/v1/dashboard/analytics', requireAdmin, (req, res) => {
  const orders = getOrders();
  const wholesaleRequests = getWholesaleRequests();
  const products = getProducts();
  const users = getUsers();
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
  const quotations = getQuotations();
  res.json(quotations);
});

app.post('/api/v1/quotations', requireAdmin, (req, res) => {
  const quotations = getQuotations();
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

app.get(['/api/v1/content/videos', '/api/v1/content/videos/all'], (req, res) => {
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
      "/api/v1/silver-rate": {
        get: {
          summary: "Get Live Silver Rate (Per Gram, 999 Fine, 925 Sterling)",
          tags: ["Live Silver Rate"],
          description: "Returns live silver rates polled every 1 second from RB Gold Spot API, rate_per_kg, per-gram rates, and total products linked.",
          responses: {
            "200": {
              description: "Live silver rate statistics",
              content: {
                "application/json": {
                  example: {
                    live_silver_rate: 250.64,
                    silver_999_rate: 250.64,
                    silver_925_rate: 231.84,
                    rate_per_kg: 250641,
                    rate_difference: 0,
                    api_status: "CONNECTED",
                    total_products_linked: 177,
                    last_updated_at: "2026-08-25T03:30:00.000Z"
                  }
                }
              }
            }
          }
        }
      },
      "/api/v1/silver-rate/stream": {
        get: {
          summary: "Real-time SSE Live Silver Rate Stream (1-Second Polling)",
          tags: ["Live Silver Rate"],
          description: "Server-Sent Events (SSE) endpoint pushing 1-second live silver rate updates to clients.",
          responses: {
            "200": { description: "Event stream (text/event-stream)" }
          }
        }
      },
      "/api/v1/products": {
        get: {
          summary: "Get all products with filtering & sorting",
          tags: ["Products"],
          parameters: [
            { name: "category_id", in: "query", schema: { type: "integer" }, description: "Filter by Category ID" },
            { name: "category_slug", in: "query", schema: { type: "string" }, description: "Filter by Category Slug" },
            { name: "subcategory", in: "query", schema: { type: "string" }, description: "Filter by Subcategory name" },
            { name: "search", in: "query", schema: { type: "string" }, description: "Search by title, SKU, or description" },
            { name: "purity", in: "query", schema: { type: "string" }, description: "Filter by Silver Purity" },
            { name: "min_price", in: "query", schema: { type: "number" }, description: "Minimum price in INR" },
            { name: "max_price", in: "query", schema: { type: "number" }, description: "Maximum price in INR" },
            { name: "min_weight", in: "query", schema: { type: "number" }, description: "Minimum weight in grams" },
            { name: "max_weight", in: "query", schema: { type: "number" }, description: "Maximum weight in grams" },
            { name: "is_featured", in: "query", schema: { type: "boolean" }, description: "Filter featured products" },
            { name: "is_new_arrival", in: "query", schema: { type: "boolean" }, description: "Filter new arrivals" },
            { name: "in_stock", in: "query", schema: { type: "boolean" }, description: "Filter in-stock products (ON/OFF status)" },
            { name: "sort_by", in: "query", schema: { type: "string" }, description: "Sort order: price_asc, price_desc, weight_asc, weight_desc, newest, featured" },
            { name: "skip", in: "query", schema: { type: "integer", default: 0 }, description: "Pagination skip offset" },
            { name: "limit", in: "query", schema: { type: "integer", default: 500 }, description: "Pagination limit (default 500 to fetch full catalog)" }
          ],
          responses: { "200": { description: "List of 177 products with dynamic live silver price calculation" } }
        },
        post: {
          summary: "Create New Product (Admin Only)",
          tags: ["Products"],
          security: [{ BearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["title", "sku", "category_id", "retail_price"],
                  properties: {
                    title: { type: "string" },
                    sku: { type: "string" },
                    category_id: { type: "integer" },
                    silver_purity: { type: "string" },
                    weight_g: { type: "number" },
                    making_charges: { type: "number" },
                    retail_price: { type: "number" },
                    wholesale_price: { type: "number" },
                    stock: { type: "integer" },
                    in_stock: { type: "boolean" },
                    featured_image: { type: "string" }
                  }
                }
              }
            }
          },
          responses: { "201": { description: "Product created successfully" } }
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
        },
        put: {
          summary: "Update Product / Toggle Stock ON-OFF (Admin Only)",
          tags: ["Products"],
          security: [{ BearerAuth: [] }],
          parameters: [
            { name: "id_or_slug", in: "path", required: true, schema: { type: "string" }, description: "Product ID" }
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    stock: { type: "integer", description: "Stock quantity (0 for out of stock)" },
                    in_stock: { type: "boolean", description: "In stock toggle status (true=ON, false=OFF)" },
                    title: { type: "string" },
                    retail_price: { type: "number" }
                  }
                }
              }
            }
          },
          responses: { "200": { description: "Product updated successfully" } }
        },
        delete: {
          summary: "Delete Product (Admin Only)",
          tags: ["Products"],
          security: [{ BearerAuth: [] }],
          parameters: [
            { name: "id_or_slug", in: "path", required: true, schema: { type: "string" }, description: "Product ID" }
          ],
          responses: { "200": { description: "Product deleted" } }
        }
      },
      "/api/v1/categories": {
        get: {
          summary: "Get all categories",
          tags: ["Categories"],
          responses: { "200": { description: "List of categories" } }
        }
      },
      "/api/v1/content/homepage_hero": {
        get: {
          summary: "Get Homepage Hero Banner Content",
          tags: ["Content & CMS"],
          responses: { "200": { description: "Hero title, narrative content, and media_url" } }
        },
        put: {
          summary: "Update Homepage Hero Banner Content (Admin Only)",
          tags: ["Content & CMS"],
          security: [{ BearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    content: { type: "string" },
                    media_url: { type: "string" }
                  }
                }
              }
            }
          },
          responses: { "200": { description: "Hero content updated" } }
        }
      },
      "/api/v1/content/videos": {
        get: {
          summary: "Get 171 Manufacturing & Showcase Videos",
          tags: ["Content & CMS"],
          responses: { "200": { description: "List of 171 manufacturing and showcase video clips" } }
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
          responses: { "201": { description: "User registered successfully with access token" } }
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
          responses: { "200": { description: "Login successful with access token" } }
        }
      },
      "/api/v1/auth/me": {
        get: {
          summary: "Get Current User Profile",
          tags: ["Auth"],
          security: [{ BearerAuth: [] }],
          responses: { "200": { description: "Current user profile" } }
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
          responses: { "200": { description: "List of registered users" } }
        }
      },
      "/api/v1/wishlist": {
        get: {
          summary: "Get current user or guest wishlist",
          tags: ["Wishlist"],
          security: [{ BearerAuth: [] }],
          responses: { "200": { description: "User wishlist products" } }
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
  console.log(`  📁 Products loaded from JSON: ${getProducts().length} products`);
  console.log(`  📁 Categories loaded from JSON: ${getCategories().length} categories`);
  console.log(`  📖 Interactive API Docs: http://localhost:${PORT}/docs`);
  console.log(`========================================================`);
});
