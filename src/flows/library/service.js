const engine = require('../../engine/flowEngine');
const Book   = require('./model');
const { createError } = require('../../common/middleware/errorHandler');

const FLOW_KEY = 'library-borrow';

/**
 * LIBRARY SERVICE
 *
 * Each method corresponds to one step in the "library-borrow" flow.
 * Pattern:
 *   1. Run domain logic (look up book, update catalog, etc.)
 *   2. Call engine.advanceStep() to move the flow forward
 *   3. Return combined result
 *
 * The engine handles all status transitions and history logging.
 */

/** Start a new borrow flow for a member */
async function startBorrowFlow(memberId) {
  const instance = await engine.startInstance(FLOW_KEY, memberId, { memberId });
  return instance;
}

/** Step 1: search — find books matching query */
async function searchBook(instanceId, query, actor) {
  // Domain logic: search the catalog
  const regex = new RegExp(query, 'i');
  const books = await Book.find({
    $or: [{ title: regex }, { isbn: regex }],
  }).lean();

  // Advance the flow: search → checkout
  const output = { searchQuery: query, searchResults: books.map((b) => b.isbn) };
  const instance = await engine.advanceStep(instanceId, 'search', actor, output);

  return { instance, books };
}

/** Step 2: checkout — reserve a specific book */
async function checkoutBook(instanceId, isbn, actor) {
  // Domain logic: ensure book is available
  const book = await Book.findOne({ isbn });
  if (!book) throw createError(404, `Book "${isbn}" not found.`);
  if (!book.available) throw createError(409, `Book "${isbn}" is already checked out.`);

  // Get instance to extract memberId
  const current = await engine.getInstance(instanceId);
  const memberId = current.data.memberId;

  // Update catalog
  book.available  = false;
  book.borrowedBy = memberId;
  book.borrowedAt = new Date();
  await book.save();

  // Advance flow: checkout → return
  const output = { checkedOutIsbn: isbn, checkedOutAt: book.borrowedAt };
  const instance = await engine.advanceStep(instanceId, 'checkout', actor, output);

  return { instance, book };
}

/** Step 3: return — mark the book as returned and complete the flow */
async function returnBook(instanceId, actor) {
  const current = await engine.getInstance(instanceId);
  const isbn    = current.data.checkedOutIsbn;
  if (!isbn) throw createError(400, 'No book checked out in this instance.');

  // Update catalog
  const book = await Book.findOne({ isbn });
  if (book) {
    book.available  = true;
    book.borrowedBy = null;
    book.borrowedAt = null;
    book.returnedAt = new Date();
    await book.save();
  }

  // Advance flow: return → (no next step → instance complete)
  const output = { returnedIsbn: isbn, returnedAt: new Date() };
  const instance = await engine.advanceStep(instanceId, 'return', actor, output);

  return { instance, book };
}

/** Get full instance + history */
async function getInstanceDetail(instanceId) {
  const [instance, history] = await Promise.all([
    engine.getInstance(instanceId),
    engine.getHistory(instanceId),
  ]);
  return { instance, history };
}

module.exports = { startBorrowFlow, searchBook, checkoutBook, returnBook, getInstanceDetail };
