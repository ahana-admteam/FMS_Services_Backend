const mongoose = require('mongoose');

let isConnected = false;

async function connectMongo() {
  if (isConnected) return; 

  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/fms_db';

  try {
    await mongoose.connect(uri);

    isConnected = true;

    console.log('[MongoDB] Connected');

    //Register listeners ONLY ONCE
    mongoose.connection.once('error', (err) => {
      console.error('[MongoDB] Error:', err);
    });

    mongoose.connection.once('disconnected', () => {
      console.warn('[MongoDB] Disconnected');
    });

  } catch (error) {
    console.error('[MongoDB] Connection failed:', error);
  }
}

module.exports = { connectMongo };