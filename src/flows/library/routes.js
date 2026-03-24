const express    = require('express');
const router     = express.Router();
const controller = require('./controller');
const {
  validate,
  startRules,
  searchRules,
  checkoutRules,
  returnRules,
} = require('./validator');

// Start a new borrow flow
router.post('/start', startRules, validate, controller.start);

// Step 1 — search
router.post('/:instanceId/search', searchRules, validate, controller.search);

// Step 2 — checkout
router.post('/:instanceId/checkout', checkoutRules, validate, controller.checkout);

// Step 3 — return
router.post('/:instanceId/return', returnRules, validate, controller.returnBook);

// Read — instance detail + history
router.get('/:instanceId', controller.detail);

module.exports = router;
