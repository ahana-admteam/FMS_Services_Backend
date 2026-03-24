const mongoose = require('mongoose');

/**
 * LOCAL LIBRARY MODEL
 * A simple book catalog — separate from the flow runtime models.
 * Only the library flow reads/writes this collection.
 */

const BookSchema = new mongoose.Schema(
  {
    isbn:        { type: String, required: true, unique: true },
    title:       { type: String, required: true },
    author:      { type: String, required: true },
    available:   { type: Boolean, default: true },
    borrowedBy:  { type: String, default: null },  // memberId
    borrowedAt:  { type: Date, default: null },
    returnedAt:  { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Book', BookSchema);
