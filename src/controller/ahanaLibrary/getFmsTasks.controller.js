const express = require("express");
const getFmsTasks = express.Router();
let MongoClient = require('mongodb').MongoClient;
const axios = require('axios');
const moment = require('moment-timezone');
const { fetchUserDetails } = require("../../../helpers/fetchuserDetails");
const { infoLogger, errorLogger } = require("../../../middleware/logger");

// MODELS
const FmsTasks = require("../../models/fmsTasks.model");
const FmsMaster = require("../../models/fmsMaster.model");
const FmsQA = require("../../models/fmsQA.model");


//find ALL FMS Tasks FOR A USER 
getFmsTasks.get('/findAllFmsTasksForUser', async (req, res) => {
 try {
    const token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({ message: "Authorization header missing" });
    }

    // ✅ Fetch actual user details from token
    const userDetails = await fetchUserDetails(token);
    const documents = await FmsTasks.find({ "fmsTaskDoer.empId": userDetails.result.emp_id });

    res.json({
      message: documents,
      status: 200
    });

  } catch (error) {
    console.error("Error in findSingleFms:", error);
    return res.status(500).json({ error: error.message });
  }
});

//ALL PENDING tasks
getFmsTasks.get('/finduserFmsTasks', async (req, res) => {
    try {

        const token = req.headers.authorization;
        
            if (!token) {
              return res.status(401).json({ message: "Authorization header missing" });
            }
        
            // ✅ Fetch actual user details from token
            const userDetails = await fetchUserDetails(token);

        const documents = await FmsTasks.find(
            {"fmsTaskDoer.empId": userDetails.result.emp_id, fmsTaskStatus: { $in: ["PENDING", "COMPLETED"] }}
        );

        res.json({
            "message": documents,
            "status": 200
        })

    }
    catch (error) {
        console.error('Error', error);
        return res.status(500).json({ error: error.message });
    }
})


module.exports = getFmsTasks;