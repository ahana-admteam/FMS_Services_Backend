const express = require("express");
const router = express.Router();

const permission = require("../../../src/controller/userManagement/permission");

// mount controllers
router.use('/', permission);

module.exports = router;