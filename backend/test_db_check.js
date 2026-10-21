require('dotenv').config();
const dns = require('dns');
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

const mongoose = require('mongoose');

async function check() {
  console.log('Testing URI:', process.env.MONGODB_URI);
  try {
    await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 8000 });
    console.log('MongoDB connection SUCCESSFUL');
    const cols = await mongoose.connection.db.listCollections().toArray();
    console.log('Collections count:', cols.length);
    for (const col of cols) {
      const count = await mongoose.connection.db.collection(col.name).countDocuments();
      console.log(` - ${col.name}: ${count}`);
    }
  } catch (err) {
    console.error('MongoDB connection FAILED:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

check();
