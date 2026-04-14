const express = require("express");
const router = express.Router();

const getFms = require("../../controller/ahanaLibrary/getFms.controller");

// mount controller
router.use('/', getFms);

module.exports = router;

