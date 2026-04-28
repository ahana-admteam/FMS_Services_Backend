const express = require("express");
const router = express.Router();

const submitQuestionare = require("../../controller/ahanaLibrary/submitQuestionare.controller");

router.use('/', submitQuestionare);

module.exports = router;