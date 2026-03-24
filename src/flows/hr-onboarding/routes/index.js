const express    = require('express');
const router     = express.Router();
const controller = require('../controllers/hr.controller');
const {
  validate,
  startRules,
  documentRules,
  approvalRules,
} = require('../validators/hr.validator');

// Start onboarding for a new employee
router.post('/start', startRules, validate, controller.start);

// Step 1 — HR submits collected documents
router.post('/:instanceId/documents', documentRules, validate, controller.submitDocuments);

// Step 2 — Compliance verifies documents
router.post('/:instanceId/verify', approvalRules, validate, controller.verifyDocuments);

// Step 3 — Manager approves (auto-triggers steps 4 & 5 on approval)
router.post('/:instanceId/approve', approvalRules, validate, controller.managerApproval);

// Read — full instance + history + employee record
router.get('/:instanceId', controller.detail);

// Cancel
router.post('/:instanceId/cancel', controller.cancel);

module.exports = router;
