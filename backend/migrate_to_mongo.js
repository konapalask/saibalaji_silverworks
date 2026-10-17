require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const models = require('./models');

const mongoUri = process.argv[2] || process.env.MONGODB_URI;

if (!mongoUri) {
  console.error('\x1b[31m[ERROR] MongoDB URI not provided.\x1b[0m');
  console.log('Usage:');
  console.log('  1. Add MONGODB_URI=mongodb+srv://... to your backend/.env file and run:');
  console.log('     node migrate_to_mongo.js');
  console.log('  OR');
  console.log('  2. Pass it directly as an argument:');
  console.log('     node migrate_to_mongo.js "mongodb+srv://user:pass@cluster.mongodb.net/saibalaji_silverworks"\n');
  process.exit(1);
}

const filesToMigrate = [
  { file: 'categories_data.json', model: models.Category, name: 'Categories' },
  { file: 'products_data.json', model: models.Product, name: 'Products' },
  { file: 'users.json', model: models.User, name: 'Users' },
  { file: 'orders_data.json', model: models.Order, name: 'Orders' },
  { file: 'wholesale_requests_data.json', model: models.WholesaleRequest, name: 'Wholesale Requests' },
  { file: 'quotations_data.json', model: models.Quotation, name: 'Quotations' },
  { file: 'wishlists_data.json', model: models.Wishlist, name: 'Wishlists' },
  { file: 'videos_data.json', model: models.Video, name: 'Videos' },
  { file: 'gallery_data.json', model: models.Gallery, name: 'Gallery' },
  { file: 'settings_data.json', model: models.Setting, name: 'Settings', isSingle: true },
  { file: 'homepage_hero_data.json', model: models.HomepageHero, name: 'Homepage Hero', isSingle: true }
];

async function runMigration() {
  console.log('\x1b[36m========================================================\x1b[0m');
  console.log('\x1b[36m Sai Balaji Silverworks - JSON to Cloud MongoDB Migration\x1b[0m');
  console.log('\x1b[36m========================================================\x1b[0m\n');

  try {
    console.log(`Connecting to Cloud MongoDB...`);
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 10000 });
    console.log('\x1b[32m[CONNECTED] Successfully established connection to Cloud MongoDB!\x1b[0m\n');

    const summary = [];

    for (const item of filesToMigrate) {
      const filePath = path.join(__dirname, item.file);
      if (!fs.existsSync(filePath)) {
        summary.push({ Collection: item.name, SourceFile: item.file, Status: 'Skipped (File not found)', Count: 0 });
        continue;
      }

      let content = fs.readFileSync(filePath, 'utf8').trim().replace(/^\uFEFF/, '');
      if (!content) {
        summary.push({ Collection: item.name, SourceFile: item.file, Status: 'Skipped (Empty file)', Count: 0 });
        continue;
      }

      const data = JSON.parse(content);

      if (item.isSingle) {
        await item.model.deleteMany({});
        await item.model.create(data);
        summary.push({ Collection: item.name, SourceFile: item.file, Status: 'Migrated OK', Count: 1 });
      } else if (Array.isArray(data)) {
        await item.model.deleteMany({});
        if (data.length > 0) {
          // Clean documents - strip any stray Mongo _id if previously exported
          const cleaned = data.map(doc => {
            const copy = { ...doc };
            delete copy._id;
            delete copy.__v;
            return copy;
          });
          await item.model.insertMany(cleaned, { ordered: false });
        }
        summary.push({ Collection: item.name, SourceFile: item.file, Status: 'Migrated OK', Count: data.length });
      }
    }

    console.table(summary);
    console.log('\n\x1b[32m[SUCCESS] All data has been successfully migrated to Cloud MongoDB Atlas!\x1b[0m\n');
  } catch (err) {
    console.error('\x1b[31m[MIGRATION FAILED]:\x1b[0m', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB connection closed.');
  }
}

runMigration();
