require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
const mongoose = require('mongoose');

async function test() {
  console.log('URI:', process.env.MONGODB_URI);
  mongoose.set('debug', true);
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('Connected successfully!');
  } catch (err) {
    console.error('Error name:', err.name);
    console.error('Error message:', err.message);
    if (err.reason) {
      console.error('Reason servers:', JSON.stringify(err.reason.servers, null, 2));
    }
  } finally {
    process.exit(0);
  }
}

test();
