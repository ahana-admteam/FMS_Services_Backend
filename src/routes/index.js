const express = require('express');
const router = express.Router();

const libraryRoutes = require('../flows/library/routes');
const hrOnboardingRoutes = require('../flows/hr-onboarding/routes/index');

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'fms-service',
    timestamp: new Date().toISOString(),
  });
});

// Flow routes
router.use('/flows/library', libraryRoutes);
router.use('/flows/hr-onboarding', hrOnboardingRoutes);

module.exports = router;
