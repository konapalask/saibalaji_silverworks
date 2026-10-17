const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const models = require('./models');

let isConnectedState = false;

/**
 * Connect to MongoDB Cloud using MONGODB_URI
 */
async function connectDB(uri) {
  const mongoUri = uri || process.env.MONGODB_URI;

  if (!mongoUri) {
    console.warn('\x1b[33m[!WARN] MONGODB_URI not configured in .env. Operating in fallback JSON mode.\x1b[0m');
    return false;
  }

  try {
    console.log('\x1b[36m[MongoDB] Connecting to Cloud MongoDB Atlas...\x1b[0m');
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 8000,
      socketTimeoutMS: 45000,
    });

    isConnectedState = true;
    console.log('\x1b[32m[MongoDB] Successfully connected to Cloud MongoDB Atlas!\x1b[0m');

    // Automatically check and seed empty collections from JSON if needed
    await seedFromFilesIfEmpty();

    return true;
  } catch (err) {
    isConnectedState = false;
    console.error('\x1b[31m[MongoDB] Connection error:\x1b[0m', err.message);
    console.warn('\x1b[33m[!WARN] Server will continue running with JSON backup until Cloud MongoDB recovers.\x1b[0m');
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
});

function isConnected() {
  return isConnectedState && mongoose.connection.readyState === 1;
}

/**
 * Seed empty MongoDB collections from existing local JSON files on first boot
 */
async function seedFromFilesIfEmpty() {
  if (!isConnected()) return;

  for (const [filename, Model] of Object.entries(models.fileModelMap)) {
    try {
      const count = await Model.countDocuments();
      if (count === 0) {
        const filePath = path.join(__dirname, filename);
        if (fs.existsSync(filePath)) {
          let content = fs.readFileSync(filePath, 'utf8').trim();
          if (content.length > 0) {
            content = content.replace(/^\uFEFF/, '');
            const parsed = JSON.parse(content);
            if (Array.isArray(parsed) && parsed.length > 0) {
              await Model.insertMany(parsed, { ordered: false });
              console.log(`\x1b[32m[MongoDB Seed] Populated ${parsed.length} records into ${Model.modelName} from ${filename}\x1b[0m`);
            } else if (!Array.isArray(parsed) && typeof parsed === 'object') {
              await Model.findOneAndUpdate({}, parsed, { upsert: true, new: true });
              console.log(`\x1b[32m[MongoDB Seed] Populated document into ${Model.modelName} from ${filename}\x1b[0m`);
            }
          }
        }
      }
    } catch (err) {
      console.error(`[MongoDB Seed] Error seeding ${filename}:`, err.message);
    }
  }
}

/**
 * Sync data array or object directly into MongoDB
 */
async function syncToMongo(filename, data) {
  if (!isConnected()) return;

  const Model = models.fileModelMap[filename];
  if (!Model) return;

  try {
    if (!Array.isArray(data) && typeof data === 'object') {
      // Single object collection (e.g. settings, homepage_hero)
      await Model.findOneAndUpdate({}, { $set: data }, { upsert: true, new: true });
      return;
    }

    if (Array.isArray(data)) {
      if (data.length === 0) {
        await Model.deleteMany({});
        return;
      }

      // Upsert all items by id or user_id
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

/**
 * Fetch data from MongoDB with fallback
 */
async function fetchFromMongo(filename, defaultValue) {
  if (!isConnected()) return null;

  const Model = models.fileModelMap[filename];
  if (!Model) return null;

  try {
    if (Array.isArray(defaultValue)) {
      const docs = await Model.find({}).lean();
      return docs.map(({ _id, __v, ...rest }) => rest);
    } else {
      const doc = await Model.findOne({}).lean();
      if (!doc) return null;
      const { _id, __v, ...rest } = doc;
      return rest;
    }
  } catch (err) {
    console.error(`[MongoDB Fetch] Error fetching ${filename}:`, err.message);
    return null;
  }
}

/**
 * Hydrate local JSON files from Cloud MongoDB if MongoDB already contains collections
 */
async function hydrateLocalFromMongo() {
  if (!isConnected()) return;

  for (const [filename, Model] of Object.entries(models.fileModelMap)) {
    try {
      const count = await Model.countDocuments();
      if (count > 0) {
        const filePath = path.join(__dirname, filename);
        let cloudData;
        if (filename === 'settings_data.json' || filename === 'homepage_hero_data.json') {
          const doc = await Model.findOne({}).lean();
          if (doc) {
            const { _id, __v, ...rest } = doc;
            cloudData = rest;
          }
        } else {
          const docs = await Model.find({}).lean();
          cloudData = docs.map(({ _id, __v, ...rest }) => rest);
        }

        if (cloudData) {
          fs.writeFileSync(filePath, JSON.stringify(cloudData, null, 2), 'utf8');
          console.log(`\x1b[32m[MongoDB Hydrate] Synced ${filename} from Cloud MongoDB (${Array.isArray(cloudData) ? cloudData.length + ' records' : 'document'})\x1b[0m`);
        }
      }
    } catch (err) {
      console.error(`[MongoDB Hydrate] Error hydrating ${filename}:`, err.message);
    }
  }
}

module.exports = {
  connectDB,
  isConnected,
  syncToMongo,
  fetchFromMongo,
  seedFromFilesIfEmpty,
  hydrateLocalFromMongo,
  models
};

