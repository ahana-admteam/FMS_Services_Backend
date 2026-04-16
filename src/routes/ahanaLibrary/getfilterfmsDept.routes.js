const express = require("express");
const router = express.Router();

const getfilterfmsDept = require("../../controller/ahanaLibrary/getfilterfmsDept.controller");

// mount controllers
router.use('/', getfilterfmsDept);

module.exports = router;