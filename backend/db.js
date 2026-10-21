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
let retryTimer = null;

// Live in-memory cache directly populated from Cloud MongoDB Atlas
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
 * Connect to Cloud MongoDB Atlas
 */
async function connectDB(uri) {
  const mongoUri = uri || process.env.MONGODB_URI;

  if (!mongoUri) {
    console.error('\x1b[31m[MongoDB Atlas] MONGODB_URI is not set in backend/.env!\x1b[0m');
    return false;
  }

  try {
    console.log('\x1b[36m[MongoDB Atlas] Connecting to Cloud MongoDB Atlas...\x1b[0m');
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    isConnectedState = true;
    activeMongoUri = mongoUri;
    console.log('\x1b[32m[MongoDB Atlas] Successfully connected to Cloud MongoDB Atlas!\x1b[0m');

    if (retryTimer) {
      clearInterval(retryTimer);
      retryTimer = null;
    }

    await onConnected();
    return true;
  } catch (err) {
    isConnectedState = false;
    console.error('\x1b[31m[MongoDB Atlas Connection Error]\x1b[0m', err.message);
    console.warn('\x1b[33m[!IMPORTANT] To connect, your public IP must be whitelisted in MongoDB Atlas:\x1b[0m');
    console.warn('\x1b[33m1. Open MongoDB Atlas -> Security -> Network Access\x1b[0m');
    console.warn('\x1b[33m2. Click "Add IP Address" -> "Allow Access From Anywhere" (0.0.0.0/0)\x1b[0m');
    console.warn('\x1b[33m3. Click Confirm. The server will auto-connect as soon as deployed!\x1b[0m');

    // Auto-retry connecting every 8 seconds so it connects the second the user whitelists
    if (!retryTimer) {
      retryTimer = setInterval(() => {
        if (!isConnected()) {
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
    console.log(`\x1b[32m[MongoDB Atlas] Connected to database: saibalaji_silverworks (${productCount} products found in Atlas)\x1b[0m`);
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
  hydrateFromMongo().catch(err => console.error('[MongoDB Atlas] Re-hydration error:', err.message));
});

function isConnected() {
  return isConnectedState && mongoose.connection.readyState === 1;
}

function getActiveUri() {
  return activeMongoUri;
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
        }
      } else {
        const docs = await Model.find({}).lean();
        if (docs && docs.length > 0) {
          memoryCache[key] = docs.map(({ _id, __v, ...rest }) => rest);
        }
      }
      const countStr = Array.isArray(memoryCache[key]) ? `${memoryCache[key].length} items` : '1 doc';
      console.log(`\x1b[32m[MongoDB Atlas] Hydrated ${Model.modelName} from Cloud Atlas (${countStr})\x1b[0m`);
    } catch (err) {
      console.error(`[MongoDB Atlas] Error hydrating ${key}:`, err.message);
    }
  }
}

/**
 * Retrieve data live from memory store (backed directly by Cloud Atlas)
 */
function getData(key, defaultValue = []) {
  if (memoryCache[key] !== undefined) {
    return memoryCache[key];
  }
  return defaultValue;
}

/**
 * Save data to memory cache and persist directly to Cloud MongoDB Atlas
 */
function saveData(key, data) {
  memoryCache[key] = data;

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
  saveData,
  syncToMongo,
  hydrateFromMongo,
  models
};
