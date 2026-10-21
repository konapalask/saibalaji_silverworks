const dns = require('dns');
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const models = require('./models');

let isConnectedState = false;
let activeMongoUri = '';

// Live in-memory cache directly populated from MongoDB
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
 * Load all existing local JSON data files into memoryCache as initial baseline
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
}

// Initial baseline pre-load
loadFromLocalFiles();

/**
 * Persist current memoryCache to local JSON files for backup
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
 * Connect to MongoDB with automatic fallback between Atlas and Local MongoDB
 */
async function connectDB(uri) {
  const primaryUri = uri || process.env.MONGODB_URI;
  const localUri = process.env.LOCAL_MONGODB_URI || 'mongodb://127.0.0.1:27017/saibalaji_silverworks';

  // 1. Try Primary URI (Atlas or configured URI)
  if (primaryUri) {
    try {
      console.log(`\x1b[36m[MongoDB] Connecting to MongoDB (${primaryUri.includes('mongodb+srv') ? 'Cloud Atlas' : primaryUri})...\x1b[0m`);
      await mongoose.connect(primaryUri, {
        serverSelectionTimeoutMS: 4000,
        socketTimeoutMS: 45000,
      });

      isConnectedState = true;
      activeMongoUri = primaryUri;
      console.log('\x1b[32m[MongoDB] Successfully connected to MongoDB!\x1b[0m');
      await onConnected();
      return true;
    } catch (err) {
      console.warn('\x1b[33m[MongoDB] Primary connection failed: ' + err.message + '\x1b[0m');
    }
  }

  // 2. Fall back to Local MongoDB Server (127.0.0.1:27017)
  if (localUri && localUri !== primaryUri) {
    try {
      console.log('\x1b[36m[MongoDB] Connecting to local MongoDB server (127.0.0.1:27017/saibalaji_silverworks)...\x1b[0m');
      await mongoose.connect(localUri, {
        serverSelectionTimeoutMS: 4000,
        socketTimeoutMS: 45000,
      });

      isConnectedState = true;
      activeMongoUri = localUri;
      console.log('\x1b[32m[MongoDB] Successfully connected to local MongoDB (saibalaji_silverworks)!\x1b[0m');
      await onConnected();
      return true;
    } catch (err) {
      console.warn('\x1b[33m[MongoDB] Local MongoDB connection failed: ' + err.message + '\x1b[0m');
    }
  }

  isConnectedState = false;
  console.log('\x1b[33m[MongoDB] Operating in resilient memory mode.\x1b[0m');
  return false;
}

/**
 * Post-connection hydration and auto-seeding
 */
async function onConnected() {
  try {
    const productCount = await models.Product.countDocuments();
    if (productCount > 0) {
      console.log(`\x1b[36m[MongoDB] Found ${productCount} products in MongoDB. Hydrating from MongoDB...\x1b[0m`);
      await hydrateFromMongo();
      saveLocalBackups();
    } else {
      console.log('\x1b[36m[MongoDB] MongoDB collections empty. Auto-seeding from local data files...\x1b[0m');
      await seedFromFilesIfEmpty();
      await hydrateFromMongo();
    }
  } catch (err) {
    console.error('[MongoDB] Post-connection error:', err.message);
  }
}

mongoose.connection.on('disconnected', () => {
  isConnectedState = false;
  console.warn('\x1b[33m[MongoDB] Disconnected from MongoDB.\x1b[0m');
});

mongoose.connection.on('reconnected', () => {
  isConnectedState = true;
  console.log('\x1b[32m[MongoDB] Reconnected to MongoDB.\x1b[0m');
  hydrateFromMongo().catch(err => console.error('[MongoDB] Re-hydration error:', err.message));
});

function isConnected() {
  return isConnectedState && mongoose.connection.readyState === 1;
}

function getActiveUri() {
  return activeMongoUri;
}

/**
 * Seed empty MongoDB collections from existing data files
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
 * Hydrate in-memory store directly from MongoDB collections
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
      console.log(`\x1b[32m[MongoDB] Hydrated ${Model.modelName} from MongoDB (${countStr})\x1b[0m`);
    } catch (err) {
      console.error(`[MongoDB] Error hydrating ${key}:`, err.message);
    }
  }
}

/**
 * Retrieve data live from memory store (backed directly by MongoDB)
 */
function getData(key, defaultValue = []) {
  if (memoryCache[key] !== undefined) {
    return memoryCache[key];
  }
  return defaultValue;
}

/**
 * Save data to memory cache, local JSON file, and Cloud / Local MongoDB
 */
function saveData(key, data) {
  // Update in-memory state immediately for instant read responses
  memoryCache[key] = data;

  // Persist to local JSON backup file
  try {
    const filePath = path.join(__dirname, key);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error(`[Local Data] Error saving ${key}:`, err.message);
  }

  // Persist directly to MongoDB
  if (isConnected()) {
    syncToMongo(key, data).catch((err) => {
      console.error(`\x1b[31m[MongoDB Sync Error] ${key}:\x1b[0m`, err.message);
    });
  }
}

/**
 * Direct sync data array or object to MongoDB
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
  getActiveUri,
  getData,
  saveData,
  syncToMongo,
  hydrateFromMongo,
  models
};
