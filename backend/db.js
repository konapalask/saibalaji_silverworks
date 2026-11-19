const dns = require('dns');
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const mongoose = require('mongoose');
const models = require('./models');

const DEFAULT_MONGODB_URI = 'mongodb+srv://samuelnikhilmddali123_db_user:oqY6b7J4nB2GzjAr@cluster0.whgmi0w.mongodb.net/saibalaji_silverworks?retryWrites=true&w=majority';

let isConnectedState = false;
let isConnecting = false;
let retryTimer = null;
let lastHydrateTime = 0;

// Live in-memory cache directly backed by Cloud MongoDB Atlas
const memoryCache = {
  'categories_data.json': [],
  'products_data.json': [],
  'users.json': [],
  'orders_data.json': [],
  'wholesale_requests_data.json': [],
  'quotations_data.json': [],
  'wishlists_data.json': [],
  'videos_data.json': [],
  'gallery_data.json': [],
  'settings_data.json': { whatsapp_number: '919347443997' },
  'homepage_hero_data.json': {
    title: 'Crafted in Silver. Created with Precision.',
    content: 'From traditional craftsmanship to contemporary silver designs, Sai Balaji Silverworks creates premium silver products for retail and wholesale markets.',
    media_url: '/homescreen.webp'
  }
};

/**
 * Pre-load from local JSON backup on server boot so products are immediately available
 */
function loadFromLocalBackup() {
  for (const [key, Model] of Object.entries(models.fileModelMap)) {
    const filePath = path.join(__dirname, key);
    if (fs.existsSync(filePath)) {
      try {
        const content = fs.readFileSync(filePath, 'utf8').trim().replace(/^\uFEFF/, '');
        if (content) {
          memoryCache[key] = JSON.parse(content);
        }
      } catch (err) {
        console.error(`[Local Backup] Error reading ${key}:`, err.message);
      }
    }
  }
  const prodCount = Array.isArray(memoryCache['products_data.json']) ? memoryCache['products_data.json'].length : 0;
  console.log(`\x1b[32m[Boot Data] Initialized ${prodCount} products from local backup.\x1b[0m`);
}
loadFromLocalBackup();

/**
 * Save data to local backup on disk
 */
function saveLocalBackup(key, data) {
  try {
    const filePath = path.join(__dirname, key);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {}
}

/**
 * Connect to Cloud MongoDB Atlas with auto-retry and safe state handling
 */
async function connectDB(uri) {
  const mongoUri = uri || process.env.MONGODB_URI || DEFAULT_MONGODB_URI;

  if (isConnecting) return false;
  isConnecting = true;

  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect().catch(() => {});
    }

    console.log('\x1b[36m[MongoDB Atlas] Connecting exclusively to Cloud MongoDB Atlas...\x1b[0m');
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    isConnectedState = true;
    console.log('\x1b[32m[MongoDB Atlas] Successfully connected to Cloud MongoDB Atlas!\x1b[0m');

    if (retryTimer) {
      clearInterval(retryTimer);
      retryTimer = null;
    }

    await onConnected();
    isConnecting = false;
    return true;
  } catch (err) {
    isConnectedState = false;
    isConnecting = false;
    console.error('\x1b[31m[MongoDB Atlas Connection Error]\x1b[0m', err.message);

    if (!retryTimer) {
      retryTimer = setInterval(() => {
        if (!isConnected() && !isConnecting) {
          console.log('\x1b[36m[MongoDB Atlas] Retrying connection to Cloud Atlas...\x1b[0m');
          connectDB(mongoUri).catch(() => {});
        }
      }, 8000);
    }

    return false;
  }
}

/**
 * Post-connection hydration directly from Cloud MongoDB Atlas
 */
async function onConnected() {
  try {
    const productCount = await models.Product.countDocuments();
    console.log(`\x1b[32m[MongoDB Atlas] Database: saibalaji_silverworks | ${productCount} products found in Cloud Atlas\x1b[0m`);
    await hydrateFromMongo();
  } catch (err) {
    console.error('[MongoDB Atlas] Post-connection hydration error:', err.message);
  }
}

mongoose.connection.on('disconnected', () => {
  isConnectedState = false;
  console.warn('\x1b[33m[MongoDB Atlas] Disconnected from Cloud Atlas.\x1b[0m');
});

mongoose.connection.on('reconnected', () => {
  isConnectedState = true;
  console.log('\x1b[32m[MongoDB Atlas] Reconnected to Cloud Atlas.\x1b[0m');
  const now = Date.now();
  if (now - lastHydrateTime > 60000) {
    lastHydrateTime = now;
    hydrateFromMongo().catch(err => console.error('[MongoDB Atlas] Re-hydration error:', err.message));
  }
});

function isConnected() {
  return isConnectedState && mongoose.connection.readyState === 1;
}

function getActiveUri() {
  return 'Cloud MongoDB Atlas';
}

/**
 * Hydrate in-memory store directly from Cloud MongoDB Atlas collections
 */
async function hydrateFromMongo() {
  if (!isConnected()) return;

  for (const [key, Model] of Object.entries(models.fileModelMap)) {
    try {
      if (key === 'settings_data.json' || key === 'homepage_hero_data.json') {
        const doc = await Model.findOne({}).lean();
        if (doc) {
          const { _id, __v, ...rest } = doc;
          memoryCache[key] = rest;
          saveLocalBackup(key, memoryCache[key]);
        }
      } else {
        const docs = await Model.find({}).lean();
        if (docs && docs.length > 0) {
          memoryCache[key] = docs.map(({ _id, __v, ...rest }) => rest);
          saveLocalBackup(key, memoryCache[key]);
        }
      }
      const countStr = Array.isArray(memoryCache[key]) ? `${memoryCache[key].length} items` : '1 doc';
      console.log(`\x1b[32m[MongoDB Atlas] Loaded ${Model.modelName} from Cloud Atlas (${countStr})\x1b[0m`);
    } catch (err) {
      console.error(`[MongoDB Atlas] Error hydrating ${key}:`, err.message);
    }
  }
}

/**
 * Retrieve data live from memory store with file fallback
 */
function getData(key, defaultValue = []) {
  if (memoryCache[key] !== undefined) {
    const val = memoryCache[key];
    if (Array.isArray(val) && val.length > 0) return val;
    if (!Array.isArray(val) && val && Object.keys(val).length > 0) return val;
  }
  // Safe disk fallback if cache is ever unexpectedly empty
  const filePath = path.join(__dirname, key);
  if (fs.existsSync(filePath)) {
    try {
      const content = fs.readFileSync(filePath, 'utf8').trim().replace(/^\uFEFF/, '');
      if (content) {
        const parsed = JSON.parse(content);
        memoryCache[key] = parsed;
        return parsed;
      }
    } catch (e) {}
  }
  return defaultValue;
}

/**
 * Update memoryCache only (for live real-time rate updates without hammering Atlas)
 */
function setMemoryData(key, data) {
  memoryCache[key] = data;
}

/**
 * Save data to memory cache, local backup, and Cloud MongoDB Atlas
 */
function saveData(key, data) {
  memoryCache[key] = data;
  saveLocalBackup(key, data);

  if (isConnected()) {
    syncToMongo(key, data).catch((err) => {
      console.error(`\x1b[31m[MongoDB Atlas Sync Error] ${key}:\x1b[0m`, err.message);
    });
  }
}

/**
 * Direct sync data array or object to Cloud MongoDB Atlas
 */
async function syncToMongo(filename, data) {
  if (!isConnected()) return;

  const Model = models.fileModelMap[filename];
  if (!Model) return;

  try {
    if (!Array.isArray(data) && typeof data === 'object') {
      await Model.findOneAndUpdate({}, { $set: data }, { upsert: true, returnDocument: 'after' });
      return;
    }

    if (Array.isArray(data)) {
      if (data.length === 0) {
        await Model.deleteMany({});
        return;
      }

      const idKey = (filename === 'wishlists_data.json') ? 'user_id' : 'id';

      const bulkOps = data.map(item => {
        const filter = {};
        if (item[idKey] !== undefined) {
          filter[idKey] = item[idKey];
        } else if (item.slug) {
          filter.slug = item.slug;
        } else {
          return { insertOne: { document: item } };
        }
        return {
          updateOne: {
            filter,
            update: { $set: item },
            upsert: true
          }
        };
      });

      const presentIds = data.map(d => d[idKey]).filter(id => id !== undefined);
      if (presentIds.length > 0) {
        await Model.deleteMany({ [idKey]: { $nin: presentIds } });
      }

      if (bulkOps.length > 0) {
        await Model.bulkWrite(bulkOps);
      }
    }
  } catch (err) {
    console.error(`[MongoDB Atlas Sync] Error syncing ${filename}:`, err.message);
  }
}

module.exports = {
  connectDB,
  isConnected,
  getActiveUri,
  getData,
  setMemoryData,
  saveData,
  syncToMongo,
  hydrateFromMongo,
  models
};
