const express = require("express");
const router = express.Router();

// Import route file
const submitQuestionareRoutes = require("./ahanaLibrary/submitQuestionare.routes");

//Mount it
router.use('/ahanaLibrary', submitQuestionareRoutes);

module.exports = router;