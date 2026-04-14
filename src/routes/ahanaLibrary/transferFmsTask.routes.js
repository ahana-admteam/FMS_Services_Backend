const express = require("express");
const router = express.Router();

const transferFmsTask = require("../../controller/ahanaLibrary/transferFmsTask.controller");

// Define routes
router.use('/', transferFmsTask);

module.exports = router;
