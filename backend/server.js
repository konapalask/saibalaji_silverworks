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

// Serve static images from /public directory & frontend public assets
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}
app.use('/public', express.static(publicDir));

const frontendPublicDir = path.join(__dirname, '../frontend/public');
if (fs.existsSync(frontendPublicDir)) {
  app.use(express.static(frontendPublicDir));
  app.use('/public', express.static(frontendPublicDir));
}

// Utility Functions to Load JSON Data (Preserves existing data; auto-creates missing files safely)
const loadJsonFile = (filename, defaultValue = []) => {
  const filePath = path.join(__dirname, filename);
  try {
    if (fs.existsSync(filePath)) {
      let data = fs.readFileSync(filePath, 'utf8');
      if (data && data.trim().length > 0) {
        data = data.replace(/^\uFEFF/, '');
        return JSON.parse(data);
      }
    } else {
      // File genuinely does not exist on disk - create it with default empty structure
      fs.writeFileSync(filePath, JSON.stringify(defaultValue, null, 2), 'utf8');
      return defaultValue;
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

// Reusable Dynamic Product Price Calculation Function
function calculateProductPrice(weight_g, making_charge, making_charge_type = 'fixed', silver_purity = '925', live_silver_rate = 250.64, wholesale_making_charge = null) {
  const weight = parseFloat(weight_g) || 0;
  const mc = parseFloat(making_charge) || 0;
  const wmc = wholesale_making_charge !== null && wholesale_making_charge !== undefined
    ? parseFloat(wholesale_making_charge)
    : Math.round(mc * 0.75 * 100) / 100;

  const rate = parseFloat(live_silver_rate) || 250.64;
  
  let purityFactor = 1.0;
  const purityStr = String(silver_purity).toLowerCase();
  if (purityStr.includes('925') || purityStr.includes('sterling')) {
    purityFactor = 0.925;
  } else if (purityStr.includes('999') || purityStr.includes('fine')) {
    purityFactor = 1.0;
  }

  const silverValue = Math.round(weight * purityFactor * rate * 100) / 100;
  
  let calculatedMC = mc;
  let calculatedWMC = wmc;

  if (making_charge_type === 'per_gram') {
    calculatedMC = Math.round(mc * weight * 100) / 100;
    calculatedWMC = Math.round(wmc * weight * 100) / 100;
  } else if (making_charge_type === 'percentage') {
    calculatedMC = Math.round(((silverValue * mc) / 100) * 100) / 100;
    calculatedWMC = Math.round(((silverValue * wmc) / 100) * 100) / 100;
  }
  
  const finalPrice = Math.max(1, Math.round((silverValue + calculatedMC) * 100) / 100);
  const wholesalePrice = Math.max(1, Math.round((silverValue + calculatedWMC) * 100) / 100);
  return {
    weight: weight,
    silverRate: rate,
    silverValue,
    makingCharge: calculatedMC,
    wholesaleMakingCharge: calculatedWMC,
    makingChargeType: making_charge_type,
    finalPrice,
    wholesalePrice
  };
}

// Admin Product Create (POST)
const handleCreateProduct = (req, res) => {
  const productsList = getProducts();
  const categoriesList = getCategories();

  const {
    title, sku, category_id, subcategory, product_type, silver_purity,
    weight_g, gross_weight_g, net_silver_weight_g, making_charges, making_charge_type, dimensions,
    retail_price, wholesale_price, min_wholesale_qty, stock, description, specifications,
    featured_image, is_featured, is_new_arrival, variants
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
    making_charge_type: making_charge_type || 'fixed',
    dimensions: dimensions || '',
    retail_price: retail_price ? parseFloat(retail_price) : 0,
    wholesale_price: wholesale_price ? parseFloat(wholesale_price) : (retail_price ? parseFloat(retail_price) : 0),
    min_wholesale_qty: min_wholesale_qty ? parseInt(min_wholesale_qty) : 5,
    stock: stock !== undefined ? parseInt(stock) : 25,
    description: description || '',
    specifications: specifications || '',
    featured_image: featured_image || '/public/Saibalaji products S/Floral Engraved Silver Pooja Thali Set.webp',
    is_featured: Boolean(is_featured),
    is_new_arrival: is_new_arrival !== undefined ? Boolean(is_new_arrival) : true,
    is_active: true,
    variants: Array.isArray(variants) ? variants : [],
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
    weight_g, gross_weight_g, net_silver_weight_g, making_charges, making_charge_type, dimensions,
    retail_price, wholesale_price, min_wholesale_qty, stock, description, specifications,
    featured_image, is_featured, is_new_arrival, is_active, variants
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
    making_charge_type: making_charge_type !== undefined ? making_charge_type : (existing.making_charge_type || 'fixed'),
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
    is_active: is_active !== undefined ? Boolean(is_active) : existing.is_active,
    variants: variants !== undefined ? (Array.isArray(variants) ? variants : []) : (existing.variants || [])
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

// Recalculate dynamic product prices based on live silver rate, weight, purity and making charges
function updateAllProductPrices(newSilverRate) {
  let productsList = getProducts();
  if (!productsList || productsList.length === 0) return;

  let modified = false;
  productsList = productsList.map(p => {
    let calculatedPrice = 0;
    let calculatedWholesalePrice = 0;

    const netWeight = floatVal(p.net_silver_weight_g !== undefined ? p.net_silver_weight_g : p.weight_g, 0);
    const making = floatVal(p.making_charges, 0);
    const purity = p.silver_purity || '925';
    const mcType = p.making_charge_type || 'fixed';

    if (Array.isArray(p.variants) && p.variants.length > 0) {
      const activeVariants = p.variants.filter(v => v.is_active !== false);
      const sourceVariants = activeVariants.length > 0 ? activeVariants : p.variants;
      
      let minPrice = Infinity;
      let minWholesale = Infinity;

      sourceVariants.forEach(v => {
        const vWeight = floatVal(v.weight_g, netWeight);
        const vMc = floatVal(v.making_charge, making);
        const vMcType = v.making_charge_type || mcType;
        const res = calculateProductPrice(vWeight, vMc, vMcType, purity, newSilverRate);
        if (res.finalPrice < minPrice) {
          minPrice = res.finalPrice;
          minWholesale = res.wholesalePrice;
        }
      });
      calculatedPrice = minPrice !== Infinity ? minPrice : 0;
      calculatedWholesalePrice = minWholesale !== Infinity ? minWholesale : 0;
    } else if (netWeight > 0) {
      const res = calculateProductPrice(netWeight, making, mcType, purity, newSilverRate);
      calculatedPrice = res.finalPrice;
      calculatedWholesalePrice = res.wholesalePrice;
    } else {
      const baseP = floatVal(p.base_price !== undefined ? p.base_price : p.retail_price, 2500);
      const baseSR = floatVal(p.base_silver_rate !== undefined ? p.base_silver_rate : 250.64, 250.64);
      calculatedPrice = Math.max(1, Math.round((baseP + (newSilverRate - baseSR)) * 100) / 100);
      calculatedWholesalePrice = floatVal(p.wholesale_price, calculatedPrice);
    }

    if (p.current_price !== calculatedPrice || p.retail_price !== calculatedPrice || p.wholesale_price !== calculatedWholesalePrice || p.current_silver_rate !== newSilverRate) {
      modified = true;
      return {
        ...p,
        current_silver_rate: newSilverRate,
        current_price: calculatedPrice,
        retail_price: calculatedPrice,
        wholesale_price: calculatedWholesalePrice,
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
  const ratePerGram = silverRateCache.live_silver_rate;
  res.json({
    success: true,
    metal: 'silver',
    ratePerGram: ratePerGram,
    rate_per_gram: ratePerGram,
    currency: 'INR',
    unit: 'gram',
    updatedAt: silverRateCache.last_updated_at,
    apiStatus: silverRateCache.api_status,
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

// Get Orders (Admin views all orders; Customers view their own orders)
app.get('/api/v1/orders', authenticateToken, (req, res) => {
  orders = loadJsonFile('orders_data.json', []);

  // Admin access: return all orders sorted newest first
  if (req.user && (req.user.role === 'ADMIN' || req.user.role === 'SUPER_ADMIN')) {
    const sorted = [...orders].sort((a, b) => {
      const tA = a.created_at ? new Date(a.created_at).getTime() : (a.id || 0);
      const tB = b.created_at ? new Date(b.created_at).getTime() : (b.id || 0);
      return tB - tA;
    });
    return res.json(sorted);
  }

  // Regular customer access: return user's own orders
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

  return res.json(userOrders.reverse());
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

  // Validate & Recalculate Order Item Prices using Backend Live Silver Rate
  const productsList = getProducts();
  const currentLiveRate = silverRateCache.live_silver_rate || 250.64;

  const validatedItems = (orderData.items || []).map(item => {
    const prodId = item.product_id || (item.product && item.product.id);
    const foundProduct = productsList.find(p => p.id === Number(prodId));

    if (foundProduct) {
      let variantWeight = item.weight_g || foundProduct.weight_g || 50;
      let variantMakingCharge = item.making_charge !== undefined ? item.making_charge : (foundProduct.making_charges || 0);
      let makingChargeType = foundProduct.making_charge_type || 'fixed';
      let silverPurity = foundProduct.silver_purity || '925';

      if (item.variant_id && Array.isArray(foundProduct.variants)) {
        const selectedVariant = foundProduct.variants.find(v => String(v.id) === String(item.variant_id));
        if (selectedVariant) {
          variantWeight = selectedVariant.weight_g;
          variantMakingCharge = selectedVariant.making_charge;
          if (selectedVariant.making_charge_type) makingChargeType = selectedVariant.making_charge_type;
        }
      }

      const calc = calculateProductPrice(variantWeight, variantMakingCharge, makingChargeType, silverPurity, currentLiveRate);
      const validatedUnitPrice = calc.finalPrice;
      const qty = parseInt(item.quantity) || 1;

      return {
        ...item,
        product_id: foundProduct.id,
        product_name: item.product_name || foundProduct.title,
        product_sku: item.product_sku || foundProduct.sku,
        unit_price: validatedUnitPrice,
        price: validatedUnitPrice,
        quantity: qty,
        subtotal: validatedUnitPrice * qty,
        silver_rate_used: currentLiveRate,
        weight_g: variantWeight,
        making_charge: variantMakingCharge,
        measurement: item.measurement || (item.variant_id ? item.measurement : foundProduct.dimensions)
      };
    }
    const qty = parseInt(item.quantity) || 1;
    const unitP = parseFloat(item.unit_price || item.price || 0);
    return {
      ...item,
      quantity: qty,
      unit_price: unitP,
      subtotal: unitP * qty
    };
  });

  const calculatedSubtotal = validatedItems.reduce((acc, item) => acc + (item.subtotal || 0), 0);
  const taxAmount = orderData.tax_amount !== undefined ? parseFloat(orderData.tax_amount) : Math.round(calculatedSubtotal * 0.03);
  const shippingCharge = orderData.shipping_charge !== undefined ? parseFloat(orderData.shipping_charge) : 0;
  const calculatedGrandTotal = calculatedSubtotal + taxAmount + shippingCharge;

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
    items: validatedItems,
    subtotal: calculatedSubtotal,
    tax_amount: taxAmount,
    shipping_charge: shippingCharge,
    grand_total: calculatedGrandTotal,
    live_silver_rate_applied: currentLiveRate,
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

// Admin view all wholesale requests (Sorted Newest First)
app.get('/api/v1/wholesale/requests', requireAdmin, (req, res) => {
  wholesaleRequests = loadJsonFile('wholesale_requests_data.json', []);
  const sorted = [...wholesaleRequests].sort((a, b) => {
    const tA = a.created_at ? new Date(a.created_at).getTime() : (a.id || 0);
    const tB = b.created_at ? new Date(b.created_at).getTime() : (b.id || 0);
    return tB - tA;
  });
  res.json(sorted);
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

// Admin update wholesale request status (e.g. Accept Order)
app.all(['/api/v1/wholesale/requests/:id/status', '/api/v1/wholesale/requests/:id/accept'], (req, res) => {
  wholesaleRequests = loadJsonFile('wholesale_requests_data.json', []);
  const paramId = req.params.id;
  const status = (req.body && req.body.status) ? req.body.status : 'Order Accepted';

  let targetReq = wholesaleRequests.find(r => 
    String(r.id) === String(paramId) || 
    r.request_number === paramId ||
    (r.request_number && String(r.request_number).toLowerCase() === String(paramId).toLowerCase())
  );

  if (!targetReq) {
    targetReq = wholesaleRequests.find(r => r.status !== 'Order Accepted') || wholesaleRequests[0];
  }

  if (targetReq) {
    targetReq.status = status;
    targetReq.updated_at = new Date().toISOString();
    saveJsonFile('wholesale_requests_data.json', wholesaleRequests);

    // Sync status to associated quotation if it exists
    const quotations = getQuotations();
    const matchedQuote = quotations.find(q => 
      String(q.wholesale_request_id) === String(targetReq.id) || 
      String(q.wholesale_request_id) === String(targetReq.request_number) ||
      q.quote_number === targetReq.request_number ||
      q.quotation_number === targetReq.request_number
    );
    if (matchedQuote) {
      matchedQuote.status = status;
      saveJsonFile('quotations_data.json', quotations);
    }

    return res.json({ message: 'Wholesale request status updated successfully', request: targetReq, matchedQuote });
  }

  res.status(404).json({ detail: 'Wholesale request not found' });
});

app.get('/api/v1/quotations/all', (req, res) => {
  const quotations = getQuotations();
  res.json(quotations);
});

app.post('/api/v1/quotations', requireAdmin, (req, res) => {
  const quotations = getQuotations();
  const wholesaleRequests = getWholesaleRequests();
  const productsList = getProducts();
  const quoteData = req.body;

  const reqId = quoteData.wholesale_request_id;
  const matchedReq = wholesaleRequests.find(r => r.id === reqId || r.request_number === reqId);

  let items = quoteData.items || [];
  if (items.length === 0 && matchedReq && matchedReq.items) {
    items = matchedReq.items.map(it => {
      const p = productsList.find(prod => prod.id === it.product_id);
      const unitP = p ? (p.wholesale_price || p.retail_price || 3500) : 3500;
      const qty = it.requested_quantity || 1;
      return {
        product_id: it.product_id,
        product_name: it.product_name || p?.title || 'Silver Item',
        product_sku: it.product_sku || p?.sku || 'SBS-SKU',
        measurement: it.measurement || it.selected_measurement || it.size || p?.dimensions || 'Standard',
        size: it.measurement || it.selected_measurement || it.size || p?.dimensions || 'Standard',
        weight_g: it.weight_g || p?.weight_g || 50,
        purity: p?.silver_purity || '925 Sterling Silver',
        quantity: qty,
        unit_price: unitP,
        subtotal: unitP * qty,
        featured_image: it.featured_image || p?.featured_image
      };
    });
  }

  const calculatedSubtotal = items.reduce((acc, it) => acc + (it.subtotal || (it.unit_price * it.quantity) || 0), 0);
  const discount = parseFloat(quoteData.discount_amount || 0);
  const tax = parseFloat(quoteData.tax_amount || Math.round((calculatedSubtotal - discount) * 0.03));
  const shipping = parseFloat(quoteData.shipping_charge || 0);
  const grandTotal = Math.max(0, calculatedSubtotal - discount + tax + shipping);

  const newQuote = {
    id: quotations.length > 0 ? Math.max(...quotations.map(q => q.id)) + 1 : 1,
    quotation_number: `SBS-QT-${Date.now().toString().slice(-6)}`,
    quote_number: `SBS-QT-${Date.now().toString().slice(-6)}`,
    wholesale_request_id: reqId,
    company_name: quoteData.company_name || matchedReq?.company_name || 'Valued Business Client',
    contact_person: quoteData.contact_person || matchedReq?.contact_person || '',
    phone: quoteData.phone || matchedReq?.phone || '',
    email: quoteData.email || matchedReq?.email || '',
    gstin: quoteData.gstin || matchedReq?.gstin || '',
    address: quoteData.address || matchedReq?.address || '',
    items,
    subtotal: calculatedSubtotal,
    discount_amount: discount,
    tax_amount: tax,
    shipping_charge: shipping,
    grand_total: grandTotal,
    valid_until: quoteData.valid_until || '2026-09-30',
    payment_terms: quoteData.payment_terms || '50% Advance upon quotation acceptance, 50% prior to dispatch.',
    delivery_terms: quoteData.delivery_terms || 'Dispatch via insured logistics within 5 business days.',
    notes: quoteData.notes || 'Official B2B Wholesale Quotation by Sai Balaji Silver Works Sales Desk.',
    created_at: new Date().toISOString()
  };

  quotations.push(newQuote);
  saveJsonFile('quotations_data.json', quotations);

  if (matchedReq) {
    matchedReq.status = 'QUOTE_ISSUED';
    saveJsonFile('wholesale_requests_data.json', wholesaleRequests);
  }

  res.status(201).json(newQuote);
});

// Base64 Image Encoder for PDF & Offline HTML Rendering
const getImageAsDataUri = (rawImgPath) => {
  if (!rawImgPath) return '';
  if (rawImgPath.startsWith('data:image')) return rawImgPath;

  const cleanRelative = rawImgPath.replace(/^\/(public\/)?/, '');
  const possiblePaths = [
    path.join(__dirname, '../frontend/public', cleanRelative),
    path.join(__dirname, 'public', cleanRelative),
    path.join(__dirname, '../frontend/public', rawImgPath),
    path.join(__dirname, 'public', rawImgPath),
    path.join(__dirname, rawImgPath)
  ];

  for (const filePath of possiblePaths) {
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      try {
        const fileData = fs.readFileSync(filePath);
        const ext = path.extname(filePath).toLowerCase().replace('.', '');
        const mime = ext === 'png' ? 'image/png' : ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : 'image/webp';
        return `data:${mime};base64,${fileData.toString('base64')}`;
      } catch (e) {}
    }
  }

  if (rawImgPath.startsWith('http://') || rawImgPath.startsWith('https://')) {
    return rawImgPath;
  }

  return rawImgPath.startsWith('/') ? rawImgPath : `/${rawImgPath}`;
};

// Render Printable PDF Quotation HTML
const renderQuotationPdfHtml = (quote, reqData, productsList = []) => {
  const qNum = quote.quotation_number || quote.quote_number || `SBS-QT-${quote.id}`;
  const company = quote.company_name || reqData?.company_name || 'Valued Commercial Buyer';
  const contact = quote.contact_person || reqData?.contact_person || 'N/A';
  const phone = quote.phone || reqData?.phone || 'N/A';
  const email = quote.email || reqData?.email || 'N/A';
  const gstin = quote.gstin || reqData?.gstin || 'N/A';
  const address = quote.address || reqData?.address || 'N/A';
  const dateStr = quote.created_at ? new Date(quote.created_at).toLocaleDateString() : new Date().toLocaleDateString();
  const validUntil = quote.valid_until || '2026-09-30';

  const items = quote.items || reqData?.items || [];
  const subtotal = quote.subtotal || items.reduce((a, b) => a + (b.subtotal || (b.unit_price * b.quantity) || 0), 0);
  const discount = quote.discount_amount || 0;
  const tax = quote.tax_amount !== undefined ? quote.tax_amount : Math.round((subtotal - discount) * 0.03);
  const shipping = quote.shipping_charge || 0;
  const grandTotal = quote.grand_total || (subtotal - discount + tax + shipping);

  const itemsHtml = items.map((it, idx) => {
    const title = it.product_name || it.title || 'Pure Silver Article';
    const sku = it.product_sku || it.sku || 'SBS-SILVER';
    const catalogProd = (productsList || []).find(p => String(p.id) === String(it.product_id) || p.sku === sku || p.title === title);
    const reqItem = (reqData?.items && reqData.items[idx]) ? reqData.items[idx] : (reqData?.items ? reqData.items.find(r => String(r.product_id) === String(it.product_id) && (r.requested_quantity === (it.quantity || it.requested_quantity) || r.quantity === (it.quantity || it.requested_quantity))) : null);

    const size = it.measurement || it.selected_measurement || it.size || reqItem?.measurement || reqItem?.selected_measurement || reqItem?.size || catalogProd?.dimensions || 'Standard';
    const weight = (it.weight_g && it.weight_g !== 50) ? `${it.weight_g}g` : (reqItem?.weight_g ? `${reqItem.weight_g}g` : (catalogProd?.weight_g ? `${catalogProd.weight_g}g` : 'Standard'));
    const qty = it.quantity || it.requested_quantity || 1;
    const price = it.unit_price || it.price || 3500;
    const lineTotal = it.subtotal || (price * qty);

    let rawImg = it.featured_image || it.image_url || it.image || reqItem?.featured_image || catalogProd?.featured_image || catalogProd?.image_url;
    let imgDataUri = getImageAsDataUri(rawImg);

    return `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #E6E1DA; text-align: center; font-weight: bold; color: #555; vertical-align: middle;">${idx + 1}</td>
        <td style="padding: 10px; border-bottom: 1px solid #E6E1DA; text-align: center; vertical-align: middle;">
          ${imgDataUri ? `<img src="${imgDataUri}" alt="${title}" style="width: 55px; height: 55px; object-fit: cover; border-radius: 8px; border: 1px solid #C5A059; background: #000; display: block; margin: 0 auto;" />` : `<div style="width: 55px; height: 55px; border-radius: 8px; border: 1px solid #E6E1DA; background: #FAF9F5; display: flex; align-items: center; justify-content: center; font-size: 20px; margin: 0 auto;">🥈</div>`}
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #E6E1DA; vertical-align: middle;">
          <strong style="font-size: 13px; color: #1A1918; display: block; margin-bottom: 3px;">${title}</strong>
          <span style="color: #666; font-size: 10.5px; font-family: monospace; display: block;">SKU: ${sku} | Size: ${size} | Weight: ${weight} | Purity: 92.5% Sterling</span>
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #E6E1DA; text-align: center; font-weight: bold; vertical-align: middle; font-size: 12px;">${qty} Pcs</td>
        <td style="padding: 10px; border-bottom: 1px solid #E6E1DA; text-align: right; vertical-align: middle; font-family: sans-serif; font-size: 12px;">₹${price.toLocaleString()}</td>
        <td style="padding: 10px; border-bottom: 1px solid #E6E1DA; text-align: right; font-weight: bold; vertical-align: middle; font-family: sans-serif; font-size: 13px; color: #1A1918;">₹${lineTotal.toLocaleString()}</td>
      </tr>
    `;
  }).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Quotation ${qNum} - Sai Balaji Silver Works</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1A1918; margin: 0; padding: 20px; background: #FFF; }
        .invoice-box { max-width: 850px; margin: auto; padding: 30px; border: 1px solid #C5A059; border-radius: 12px; background: #FFF; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        .header { text-align: center; border-bottom: 2px solid #C5A059; padding-bottom: 20px; margin-bottom: 25px; }
        .header h1 { font-family: Georgia, serif; color: #1A1918; margin: 0; font-size: 28px; letter-spacing: 1px; }
        .header h4 { color: #C5A059; margin: 5px 0 0 0; text-transform: uppercase; font-size: 11px; letter-spacing: 3px; }
        .header p { color: #666; font-size: 11px; margin: 5px 0 0 0; }
        .info-table { width: 100%; margin-bottom: 25px; border-collapse: collapse; font-size: 12px; }
        .info-table td { vertical-align: top; padding: 8px; }
        .items-table { width: 100%; border-collapse: collapse; margin-bottom: 25px; font-size: 12px; }
        .items-table th { background: #1A1918; color: #FFF; text-transform: uppercase; font-size: 10px; letter-spacing: 1px; padding: 12px 10px; }
        .summary-box { float: right; width: 320px; font-size: 12px; margin-bottom: 25px; }
        .summary-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #EEE; }
        .summary-total { font-size: 16px; font-weight: bold; color: #C5A059; border-top: 2px solid #1A1918; border-bottom: none; padding-top: 10px; }
        .terms { clear: both; background: #FAF9F5; border: 1px solid #E6E1DA; padding: 15px; border-radius: 8px; font-size: 11px; color: #444; }
        .terms h5 { margin: 0 0 5px 0; color: #C5A059; text-transform: uppercase; font-size: 11px; }
        .no-print { text-align: center; margin-bottom: 20px; }
        .btn-print { background: #C5A059; color: white; border: none; padding: 10px 20px; font-size: 13px; font-weight: bold; border-radius: 6px; cursor: pointer; }
        @media print { .no-print { display: none; } .invoice-box { border: none; box-shadow: none; padding: 0; } }
      </style>
    </head>
    <body>
      <div class="no-print">
        <button class="btn-print" onclick="window.print()">🖨️ Print Quotation / Save as PDF</button>
      </div>
      <div class="invoice-box">
        <div class="header">
          <h1>SAI BALAJI SILVER WORKS</h1>
          <h4>Official Commercial B2B Quotation</h4>
          <p>Manufacturers & Exporters of 925 Sterling Silver & 999 Fine Silverware</p>
          <p>Address: 5-147 SF-1, Puchalapalli Sundaraiah St, Near Indian Petrol Bunk, Ramavarappadu, Vijayawada - 520008 | Phone: +91 94926 64870 / +91 91212 66269</p>
        </div>

        <table class="info-table">
          <tr>
            <td style="width: 50%;">
              <strong style="color: #C5A059; font-size: 11px; text-transform: uppercase;">Billed To / Customer Details:</strong><br/>
              <strong style="font-size: 14px;">${company}</strong><br/>
              Attn: ${contact}<br/>
              Phone: ${phone} | Email: ${email}<br/>
              GSTIN: ${gstin}<br/>
              Address: ${address}
            </td>
            <td style="width: 50%; text-align: right;">
              <strong style="color: #C5A059; font-size: 11px; text-transform: uppercase;">Quotation Reference:</strong><br/>
              <strong style="font-size: 16px; color: #1A1918;">${qNum}</strong><br/>
              Date Issued: <strong>${dateStr}</strong><br/>
              Valid Until: <strong>${validUntil}</strong><br/>
              Silver Purity: <strong>92.5% Sterling</strong>
            </td>
          </tr>
        </table>

        <table class="items-table">
          <thead>
            <tr>
              <th style="width: 35px; text-align: center;">#</th>
              <th style="width: 70px; text-align: center;">PRODUCT IMAGE</th>
              <th style="text-align: left;">ITEM DESCRIPTION & SPECIFICATIONS</th>
              <th style="width: 70px; text-align: center;">QTY</th>
              <th style="width: 110px; text-align: right;">UNIT RATE</th>
              <th style="width: 120px; text-align: right;">TOTAL AMOUNT</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div class="summary-box">
          <div class="summary-row">
            <span>Subtotal:</span>
            <span>₹${subtotal.toLocaleString()}</span>
          </div>
          ${discount > 0 ? `<div class="summary-row" style="color: green;"><span>Special Discount:</span><span>-₹${discount.toLocaleString()}</span></div>` : ''}
          <div class="summary-row">
            <span>GST Tax (3% Silver Rate):</span>
            <span>₹${tax.toLocaleString()}</span>
          </div>
          <div class="summary-row">
            <span>Insured Freight & Handling:</span>
            <span>${shipping === 0 ? 'FREE' : `₹${shipping.toLocaleString()}`}</span>
          </div>
          <div class="summary-row summary-total">
            <span>GRAND TOTAL:</span>
            <span>₹${grandTotal.toLocaleString()}</span>
          </div>
        </div>

        <div class="terms">
          <h5>Terms & Conditions:</h5>
          <p>• <strong>Payment Terms:</strong> ${quote.payment_terms || '50% Advance upon quotation acceptance, 50% prior to dispatch.'}</p>
          <p>• <strong>Delivery Terms:</strong> ${quote.delivery_terms || 'Dispatch via insured logistics within 5 business days.'}</p>
          <p>• <strong>Notes:</strong> ${quote.notes || 'Official quotation issued by Sai Balaji Silver Works Commercial Desk.'}</p>
          <p>• <strong>Bank Account Details:</strong> Sai Balaji Silver Works | A/C: 987654321098 | IFSC: SBIN0001234 | State Bank of India</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Endpoint for viewing/downloading PDF Quotation
app.get(['/api/v1/quotations/:id/pdf', '/api/v1/wholesale/requests/:id/pdf'], (req, res) => {
  const quotations = getQuotations();
  const wholesaleRequests = getWholesaleRequests();
  const productsList = getProducts();
  const idOrNum = req.params.id;

  let quote = quotations.find(q => String(q.id) === String(idOrNum) || q.quotation_number === idOrNum || q.quote_number === idOrNum);
  let reqData = wholesaleRequests.find(r => String(r.id) === String(idOrNum) || r.request_number === idOrNum);

  if (!quote && reqData) {
    quote = quotations.find(q => String(q.wholesale_request_id) === String(reqData.id));
  }

  if (!quote && reqData) {
    // Generate fallback quote on-the-fly for PDF view
    const items = (reqData.items || []).map(it => {
      const p = productsList.find(prod => prod.id === it.product_id);
      const unitP = p ? (p.wholesale_price || p.retail_price || 3500) : 3500;
      const qty = it.requested_quantity || 1;
      return {
        product_id: it.product_id,
        product_name: it.product_name || p?.title || 'Silver Item',
        product_sku: it.product_sku || p?.sku || 'SBS-SKU',
        measurement: it.measurement || p?.dimensions || 'Standard',
        weight_g: it.weight_g || p?.weight_g || 50,
        quantity: qty,
        unit_price: unitP,
        subtotal: unitP * qty
      };
    });
    const sub = items.reduce((a, b) => a + (b.subtotal || 0), 0);
    quote = {
      id: reqData.id,
      quotation_number: `SBS-QT-${reqData.request_number || reqData.id}`,
      wholesale_request_id: reqData.id,
      company_name: reqData.company_name,
      contact_person: reqData.contact_person,
      phone: reqData.phone,
      email: reqData.email,
      gstin: reqData.gstin,
      address: reqData.address,
      items,
      subtotal: sub,
      discount_amount: 0,
      tax_amount: Math.round(sub * 0.03),
      shipping_charge: 0,
      grand_total: sub + Math.round(sub * 0.03),
      valid_until: '2026-09-30',
      created_at: reqData.created_at
    };
  }

  if (!quote) {
    return res.status(404).send('Quotation not found');
  }

  const html = renderQuotationPdfHtml(quote, reqData, productsList);
  res.setHeader('Content-Type', 'text/html');
  res.send(html);
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
      <style>
        html { box-sizing: border-box; overflow-y: scroll; }
        *, *:before, *:after { box-sizing: inherit; }
        body { margin:0; background: #fafafa; }
        .swagger-ui .topbar { display: none; }
      </style>
    </head>
    <body>
      <div id="swagger-ui"></div>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.18.3/swagger-ui-bundle.js"></script>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.18.3/swagger-ui-standalone-preset.js"></script>
      <script>
        window.onload = function() {
          window.ui = SwaggerUIBundle({
            url: "/openapi.json",
            dom_id: '#swagger-ui',
            deepLinking: true,
            presets: [
              SwaggerUIBundle.presets.apis,
              SwaggerUIStandalonePreset
            ],
            plugins: [
              SwaggerUIBundle.plugins.DownloadUrl
            ],
            layout: "BaseLayout",
            persistAuthorization: true,
            displayRequestDuration: true,
            tryItOutEnabled: true
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
    servers: [
      {
        url: "/",
        description: "Current Express API Server"
      }
    ],
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
        get: {
          summary: "Get Orders (Admin: All Orders | Customer: Own Orders)",
          tags: ["Orders"],
          security: [{ BearerAuth: [] }],
          description: "Retrieve orders. Admins receive all store orders; authenticated customers receive their own order history.",
          responses: {
            "200": {
              description: "List of retail orders sorted newest first",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "integer" },
                        order_number: { type: "string" },
                        user_id: { type: "integer", nullable: true },
                        customer_name: { type: "string" },
                        customer_email: { type: "string" },
                        customer_phone: { type: "string" },
                        shipping_address: { type: "string" },
                        shipping_city: { type: "string" },
                        shipping_state: { type: "string" },
                        shipping_pincode: { type: "string" },
                        items: { type: "array" },
                        subtotal: { type: "number" },
                        tax_amount: { type: "number" },
                        shipping_charge: { type: "number" },
                        grand_total: { type: "number" },
                        live_silver_rate_applied: { type: "number" },
                        status: { type: "string" },
                        created_at: { type: "string", format: "date-time" }
                      }
                    }
                  }
                }
              }
            },
            "401": { description: "Unauthorized - Token missing or invalid" },
            "403": { description: "Forbidden - Admin privilege required" }
          }
        },
        post: {
          summary: "Create New Order",
          tags: ["Orders"],
          description: "Creates a new retail customer order with server-side live silver rate calculation.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["items"],
                  properties: {
                    customer_name: { type: "string" },
                    customer_email: { type: "string" },
                    customer_phone: { type: "string" },
                    shipping_address: { type: "string" },
                    shipping_city: { type: "string" },
                    shipping_state: { type: "string" },
                    shipping_pincode: { type: "string" },
                    items: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          product_id: { type: "integer" },
                          quantity: { type: "integer" },
                          weight_g: { type: "number" },
                          variant_id: { type: "string" }
                        }
                      }
                    },
                    tax_amount: { type: "number" },
                    shipping_charge: { type: "number" },
                    grand_total: { type: "number" }
                  }
                }
              }
            }
          },
          responses: {
            "201": { description: "Order created successfully" }
          }
        }
      },
      "/api/v1/orders/my-orders": {
        get: {
          summary: "Get Current User Order History",
          tags: ["Orders"],
          security: [{ BearerAuth: [] }],
          description: "Returns all retail orders created by or linked to the authenticated customer.",
          responses: {
            "200": {
              description: "List of orders belonging to the user",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "integer" },
                        order_number: { type: "string" },
                        user_id: { type: "integer" },
                        customer_name: { type: "string" },
                        customer_email: { type: "string" },
                        customer_phone: { type: "string" },
                        items: { type: "array" },
                        grand_total: { type: "number" },
                        status: { type: "string" },
                        created_at: { type: "string", format: "date-time" }
                      }
                    }
                  }
                }
              }
            },
            "401": { description: "Unauthorized - Token missing or invalid" }
          }
        }
      },
      "/api/v1/orders/{id}/status": {
        put: {
          summary: "Update Order Status (Admin Only)",
          tags: ["Orders"],
          security: [{ BearerAuth: [] }],
          description: "Update the fulfillment or processing status of an order.",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "integer" },
              description: "Order ID"
            }
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["status"],
                  properties: {
                    status: {
                      type: "string",
                      example: "Dispatched",
                      description: "New status for the order (e.g. Order Placed, Order Accepted, Dispatched, Delivered, Cancelled)"
                    }
                  }
                }
              }
            }
          },
          responses: {
            "200": { description: "Order status updated successfully" },
            "404": { description: "Order not found" }
          }
        }
      },
      "/api/v1/dashboard/analytics": {
        get: {
          summary: "Get Admin Dashboard Analytics (Admin Only)",
          tags: ["Dashboard"],
          security: [{ BearerAuth: [] }],
          responses: { "200": { description: "Revenue, orders, product count, and recent activity analytics" } }
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
      "/api/v1/wholesale/requests": {
        get: {
          summary: "Get All Wholesale Requests (Admin Only)",
          tags: ["Wholesale"],
          security: [{ BearerAuth: [] }],
          responses: { "200": { description: "List of wholesale quote requests" } }
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
      },
      "/api/v1/wishlist/toggle": {
        post: {
          summary: "Toggle item in wishlist",
          tags: ["Wishlist"],
          security: [{ BearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["product_id"],
                  properties: {
                    product_id: { type: "integer" }
                  }
                }
              }
            }
          },
          responses: { "200": { description: "Product added or removed from wishlist" } }
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
