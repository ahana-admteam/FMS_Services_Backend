/**
 * SEED SCRIPT
 * Upserts all flow definitions (blueprints) into MongoDB.
 * Run once before starting the server:
 *   node seed.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Flow     = require('./src/models/flow.model');
const { LIBRARY_FLOW_CONFIG }      = require('./src/flows/library/config');
const { HR_ONBOARDING_CONFIG }     = require('./src/flows/hr-onboarding/config');

// Seed book catalog for library flow
const Book = require('./src/flows/library/model');

const SEED_BOOKS = [
  { isbn: '978-0-06-112008-4', title: 'To Kill a Mockingbird', author: 'Harper Lee',     available: true },
  { isbn: '978-0-7432-7356-5', title: 'The Great Gatsby',       author: 'F. Scott Fitzgerald', available: true },
  { isbn: '978-0-14-028329-7', title: '1984',                    author: 'George Orwell', available: true },
  { isbn: '978-0-316-76948-0', title: 'The Catcher in the Rye', author: 'J.D. Salinger', available: true },
  { isbn: '978-0-7432-7357-2', title: 'Brave New World',         author: 'Aldous Huxley', available: true },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/fms_db');
  console.log('[Seed] Connected to MongoDB');

  // Upsert flows
  const flows = [LIBRARY_FLOW_CONFIG, HR_ONBOARDING_CONFIG];
  for (const config of flows) {
    await Flow.findOneAndUpdate(
      { flowKey: config.flowKey },
      config,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    console.log(`[Seed] Upserted flow: ${config.flowKey}`);
  }

  // Upsert books (only insert if not present)
  for (const book of SEED_BOOKS) {
    await Book.findOneAndUpdate(
      { isbn: book.isbn },
      { $setOnInsert: book },
      { upsert: true, new: true }
    );
  }
  console.log(`[Seed] Seeded ${SEED_BOOKS.length} books into catalog`);

  await mongoose.disconnect();
  console.log('[Seed] Done. You can now start the server.');
}

seed().catch((err) => {
  console.error('[Seed] Error:', err);
  process.exit(1);
});
