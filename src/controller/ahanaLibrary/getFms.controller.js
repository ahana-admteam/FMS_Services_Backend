const express = require("express");
const getFms = express.Router();
const axios = require('axios');
const { fetchUserDetails } = require("../../../helpers/fetchuserDetails");
const { infoLogger, errorLogger } = require("../../../middleware/logger");

// MODELS
const FmsMaster = require("../../models/fmsMaster.model");
const FmsTasks = require("../../models/fmsTasks.model");
const FmsQA = require("../../models/fmsQA.model");




//find  Single FMS using FMS Name
getFms.post('/findSingleFms', async (req, res) => {
  try {
    const token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({ message: "Authorization header missing" });
    }

    // ✅ Fetch actual user details from token
    const userDetails = await fetchUserDetails(token);

    console.log("userDetails", userDetails);

    const query = { fmsMasterId: req.body.fmsMasterId };
    const document = await FmsMaster.findOne(query);

    res.json({
      message: document,
      status: 200
    });

  } catch (error) {
    console.error("Error in findSingleFms:", error);
    return res.status(500).json({ error: error.message });
  }
});


//find ALL FMS 
getFms.get('/findAllFms', async (req, res) => {
  try {
     const token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({ message: "Authorization header missing" });
    }

    const userDetails = await fetchUserDetails(token);

    console.log("userDetails", userDetails);

    const documents = await FmsMaster.find();

    res.json({
      "message": [documents],
      "status": 200
    })

  }
  catch (error) {
    return res.status(500).json({ error: error.message });
  }
})


module.exports = getFms;