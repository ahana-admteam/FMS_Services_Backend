const express = require('express');
const router = express.Router();
const { infoLogger, errorLogger } = require('../../../middleware/logger');
const { getRequestContext } = require('../../../utils/requestContext');
// Use existing mongoose model to match submitQuestionare patterns
const FmsMaster = require('../../models/fmsMaster.model');

// GET /findByName?fmsName=...
router.get('/findByName', async (req, res) => {
  const fmsName = req.query.fmsName;
  if (!fmsName) return res.status(400).json({ error: 'Missing fmsName query parameter' });

  // read request-scoped user details for logging (set by middleware)
  const context = getRequestContext() || {};
  const userDetails = context.userDetails || {};
  const userName = userDetails.userName || 'unknown';

  try {
    infoLogger.log('info', `Username:${userName} requested fms by name: ${fmsName}`);

    // Use mongoose model to find document (case-insensitive exact match)
    const document = await FmsMaster.findOne({ fmsName: { $regex: `^${fmsName}$`, $options: 'i' } }).lean();

    if (!document) {
      infoLogger.log('info', `Username:${userName} no fms found for name: ${fmsName}`);
      return res.status(404).json({ message: 'FMS master not found', status: 404 });
    }

    infoLogger.log('info', `Username:${userName} fetched fms: ${document.fmsName}`);
    return res.json({ message: document, status: 200 });
  } catch (err) {
    errorLogger.log('error', `Failed to fetch fms by name: ${err.message}`);
    console.error('getFmsMasterData error:', err);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
