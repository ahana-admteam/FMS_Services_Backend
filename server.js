require('dotenv').config();
const app = require('./src/app');
const { connectMongo } = require('./config/mongo');

const PORT = process.env.PORT || 4000;

async function startServer() {
  try {
    await connectMongo();
    app.listen(PORT, () => {
      console.log(`[FMS] Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('[FMS] Failed to start server:', err);
    process.exit(1);
  }
}

startServer();
