const express = require('express');
const router = express.Router();

const getFmsMasterData = require('../../controller/ahanaLibrary/getFmsMasterData.controller');

// mount controller under root of this router
router.use('/', getFmsMasterData);

module.exports = router;
