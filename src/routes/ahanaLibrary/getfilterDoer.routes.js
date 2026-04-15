const express = require("express");
const router = express.Router();

const getfilterDoer = require("../../../src/controller/ahanaLibrary/getfilterDoer.controller");

// mount controllers
router.use('/', getfilterDoer);

module.exports = router;