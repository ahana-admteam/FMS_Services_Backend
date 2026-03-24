const mongoose = require('mongoose');

async function connectMongo() {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/fms_db';

  mongoose.connection.on('connected', () => console.log('[MongoDB] Connected'));
  mongoose.connection.on('error', (err) => console.error('[MongoDB] Error:', err));
  mongoose.connection.on('disconnected', () => console.warn('[MongoDB] Disconnected'));

  await mongoose.connect(uri);
}

module.exports = { connectMongo };
