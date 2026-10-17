const dns = require('dns');
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

const mongoose = require('mongoose');
const models = require('./models');

let isConnectedState = false;

// Live in-memory cache directly backed by Cloud MongoDB
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
 * Connect to Cloud MongoDB Atlas and load all collections into memory
 */
async function connectDB(uri) {
  const mongoUri = uri || process.env.MONGODB_URI;

  if (!mongoUri) {
    console.error('\x1b[31m[MongoDB] MONGODB_URI is not set in backend/.env!\x1b[0m');
    return false;
  }

  try {
    console.log('\x1b[36m[MongoDB] Connecting to Cloud MongoDB Atlas...\x1b[0m');
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    isConnectedState = true;
    console.log('\x1b[32m[MongoDB] Successfully connected to Cloud MongoDB Atlas!\x1b[0m');

    // Hydrate memory cache directly from Cloud MongoDB
    await hydrateFromMongo();

    return true;
  } catch (err) {
    isConnectedState = false;
    console.error('\x1b[31m[MongoDB] Connection error:\x1b[0m', err.message);
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
        memoryCache[key] = docs.map(({ _id, __v, ...rest }) => rest);
      }
      const countStr = Array.isArray(memoryCache[key]) ? `${memoryCache[key].length} items` : '1 doc';
      console.log(`\x1b[32m[MongoDB] Hydrated ${Model.modelName} from Cloud Atlas (${countStr})\x1b[0m`);
    } catch (err) {
      console.error(`[MongoDB] Error hydrating ${key}:`, err.message);
    }
  }
}

/**
 * Retrieve data live from MongoDB-backed memory store
 */
function getData(key, defaultValue = []) {
  if (memoryCache[key] !== undefined) {
    return memoryCache[key];
  }
  return defaultValue;
}

/**
 * Save data directly to Cloud MongoDB and update memory cache (Zero JSON file dependencies)
 */
function saveData(key, data) {
  // Update in-memory state immediately for instant read responses
  memoryCache[key] = data;

  // Persist directly to Cloud MongoDB Atlas
  syncToMongo(key, data).catch((err) => {
    console.error(`\x1b[31m[MongoDB Cloud Sync Error] ${key}:\x1b[0m`, err.message);
  });
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
