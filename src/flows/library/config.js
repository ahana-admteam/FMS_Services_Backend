/**
 * LIBRARY FLOW CONFIG
 *
 * Defines the "library-borrow" flow blueprint.
 * This config is seeded into MongoDB once via the seed script.
 *
 * Steps (in order):
 *   1. search     — member searches for a book (manual)
 *   2. checkout   — librarian checks the book out (manual)
 *   3. return     — member returns the book (manual)
 */

const LIBRARY_FLOW_CONFIG = {
  flowKey:     'library-borrow',
  name:        'Library Book Borrow',
  description: 'End-to-end flow for borrowing and returning a library book.',
  version:     1,
  isActive:    true,
  steps: [
    {
      stepKey:     'search',
      label:       'Search Book',
      type:        'manual',
      order:       1,
      description: 'Member searches for an available book by title or ISBN.',
    },
    {
      stepKey:     'checkout',
      label:       'Checkout Book',
      type:        'manual',
      order:       2,
      description: 'Librarian scans and checks out the book to the member.',
    },
    {
      stepKey:     'return',
      label:       'Return Book',
      type:        'manual',
      order:       3,
      description: 'Member returns the book; librarian marks it returned.',
    },
  ],
};

module.exports = { LIBRARY_FLOW_CONFIG };
