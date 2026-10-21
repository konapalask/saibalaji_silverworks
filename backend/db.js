const dns = require('dns');
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const models = require('./models');

let isConnectedState = false;

// Live in-memory cache backed by local JSON files & Cloud MongoDB
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
 * Load all existing local JSON data files into memoryCache immediately
 */
function loadFromLocalFiles() {
  for (const [key, Model] of Object.entries(models.fileModelMap)) {
    const filePath = path.join(__dirname, key);
    if (fs.existsSync(filePath)) {
      try {
        let content = fs.readFileSync(filePath, 'utf8').trim().replace(/^\uFEFF/, '');
        if (content) {
          const parsed = JSON.parse(content);
          memoryCache[key] = parsed;
        }
      } catch (err) {
        console.error(`[Local Data] Error loading ${key}:`, err.message);
      }
    }
  }
  const prodCount = Array.isArray(memoryCache['products_data.json']) ? memoryCache['products_data.json'].length : 0;
  const catCount = Array.isArray(memoryCache['categories_data.json']) ? memoryCache['categories_data.json'].length : 0;
  console.log(`\x1b[32m[Local Data] Pre-loaded ${prodCount} products and ${catCount} categories into memory.\x1b[0m`);
}

// Initial immediate pre-load so data is available instantly on boot
loadFromLocalFiles();

/**
 * Persist current memoryCache to local JSON files
 */
function saveLocalBackups() {
  for (const [key, data] of Object.entries(memoryCache)) {
    try {
      const filePath = path.join(__dirname, key);
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    } catch (err) {
      console.error(`[Local Data] Error saving backup for ${key}:`, err.message);
    }
  }
}

/**
 * Connect to Cloud MongoDB Atlas with automatic fallback to local JSON data
 */
async function connectDB(uri) {
  const mongoUri = uri || process.env.MONGODB_URI;

  if (!mongoUri) {
    console.warn('\x1b[33m[MongoDB] MONGODB_URI not set. Operating seamlessly with local JSON store.\x1b[0m');
    return false;
  }

  try {
    console.log('\x1b[36m[MongoDB] Connecting to Cloud MongoDB Atlas...\x1b[0m');
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    isConnectedState = true;
    console.log('\x1b[32m[MongoDB] Successfully connected to Cloud MongoDB Atlas!\x1b[0m');

    // Check if cloud collections are populated
    const productCount = await models.Product.countDocuments();
    if (productCount > 0) {
      console.log(`\x1b[36m[MongoDB] Cloud collections found (${productCount} products). Hydrating memory from Atlas...\x1b[0m`);
      await hydrateFromMongo();
      // Keep local JSON files in sync with Atlas
      saveLocalBackups();
    } else {
      console.log('\x1b[36m[MongoDB] Cloud database is empty. Auto-seeding Atlas from local data files...\x1b[0m');
      await seedFromFilesIfEmpty();
    }

    return true;
  } catch (err) {
    isConnectedState = false;
    console.warn('\x1b[33m[MongoDB] Notice: Could not connect to MongoDB Atlas cluster.\x1b[0m');
    console.warn('\x1b[33m[MongoDB] ' + err.message + '\x1b[0m');
    console.log('\x1b[32m[MongoDB] Running in high-performance local store mode (100% functional with all products).\x1b[0m');
    return false;
  }
}

mongoose.connection.on('disconnected', () => {
  isConnectedState = false;
  console.warn('\x1b[33m[MongoDB] Disconnected from Cloud MongoDB.\x1b[0m');
});

mongoose.connection.on('reconnected', () => {
  isConnectedState = true;
  console.log('\x1b[32m[MongoDB] Reconnected to Cloud MongoDB.\x1b[0m');
  hydrateFromMongo().catch(err => console.error('[MongoDB] Re-hydration error:', err.message));
});

function isConnected() {
  return isConnectedState && mongoose.connection.readyState === 1;
}

/**
 * Seed empty MongoDB collections from existing memoryCache data
 */
async function seedFromFilesIfEmpty() {
  if (!isConnected()) return;

  for (const [filename, Model] of Object.entries(models.fileModelMap)) {
    try {
      const count = await Model.countDocuments();
      if (count === 0) {
        const data = memoryCache[filename];
        if (Array.isArray(data) && data.length > 0) {
          const cleaned = data.map(doc => {
            const copy = { ...doc };
            delete copy._id;
            delete copy.__v;
            return copy;
          });
          await Model.insertMany(cleaned, { ordered: false });
          console.log(`\x1b[32m[MongoDB Seed] Populated ${cleaned.length} records into ${Model.modelName}\x1b[0m`);
        } else if (!Array.isArray(data) && typeof data === 'object' && Object.keys(data).length > 0) {
          const copy = { ...data };
          delete copy._id;
          delete copy.__v;
          await Model.findOneAndUpdate({}, { $set: copy }, { upsert: true, new: true });
          console.log(`\x1b[32m[MongoDB Seed] Populated document into ${Model.modelName}\x1b[0m`);
        }
      }
    } catch (err) {
      console.error(`[MongoDB Seed] Error seeding ${filename}:`, err.message);
    }
  }
}

/**
 * Hydrate in-memory store directly from Cloud MongoDB collections
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
        }
      } else {
        const docs = await Model.find({}).lean();
        if (docs && docs.length > 0) {
          memoryCache[key] = docs.map(({ _id, __v, ...rest }) => rest);
        }
      }
      const countStr = Array.isArray(memoryCache[key]) ? `${memoryCache[key].length} items` : '1 doc';
      console.log(`\x1b[32m[MongoDB] Hydrated ${Model.modelName} from Cloud Atlas (${countStr})\x1b[0m`);
    } catch (err) {
      console.error(`[MongoDB] Error hydrating ${key}:`, err.message);
    }
  }
}

/**
 * Retrieve data live from memory store
 */
function getData(key, defaultValue = []) {
  if (memoryCache[key] !== undefined) {
    return memoryCache[key];
  }
  return defaultValue;
}

/**
 * Save data to memory cache, local JSON file, and Cloud MongoDB Atlas if connected
 */
function saveData(key, data) {
  // Update in-memory state immediately for instant read responses
  memoryCache[key] = data;

  // Persist to local JSON file for bulletproof reliability
  try {
    const filePath = path.join(__dirname, key);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error(`[Local Data] Error saving ${key}:`, err.message);
  }

  // Persist directly to Cloud MongoDB Atlas if connected
  if (isConnected()) {
    syncToMongo(key, data).catch((err) => {
      console.error(`\x1b[31m[MongoDB Cloud Sync Error] ${key}:\x1b[0m`, err.message);
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
      await Model.findOneAndUpdate({}, { $set: data }, { upsert: true, new: true });
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

      // Remove deleted items
      const presentIds = data.map(d => d[idKey]).filter(id => id !== undefined);
      if (presentIds.length > 0) {
        await Model.deleteMany({ [idKey]: { $nin: presentIds } });
      }

      if (bulkOps.length > 0) {
        await Model.bulkWrite(bulkOps);
      }
    }
  } catch (err) {
    console.error(`[MongoDB Sync] Error syncing ${filename}:`, err.message);
  }
}

module.exports = {
  connectDB,
  isConnected,
  getData,
  saveData,
  syncToMongo,
  hydrateFromMongo,
  models
};
