const express = require("express");
const router = express.Router();

const getfilterAdmin = require("../../../src/controller/ahanaLibrary/getfilterAdmin.controller");

// mount controllers
router.use('/', getfilterAdmin);

module.exports = router;