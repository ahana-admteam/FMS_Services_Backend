const express = require("express");
const router = express.Router();

const updateFmsTasks = require("../../controller/ahanaLibrary/updateFmsTasks.controller");

router.use('/', updateFmsTasks);

module.exports = router;