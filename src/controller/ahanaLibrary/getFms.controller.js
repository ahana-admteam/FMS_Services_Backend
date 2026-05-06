const express = require("express");
const getFms = express.Router();
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
getFms.get('/findAllFmsTasksForUser', async (req, res) => {
  try {
    const token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({ message: "Authorization header missing" });
    }

    const userDetails = await fetchUserDetails(token);

    let { fmsTaskStatus, fmsTaskCompletedStatus } = req.query;

    const query = {
      "fmsTaskDoers.empId": userDetails.result.emp_id
    };

    // Handle multiple values (comma separated)
    if (fmsTaskStatus) {
      query.fmsTaskStatus = { $in: fmsTaskStatus.split(",") };
    }

    if (fmsTaskCompletedStatus) {
      query.fmsTaskCompletedStatus = { $in: fmsTaskCompletedStatus.split(",") };
    }

    const documents = await FmsTasks.find(query);

    res.json({
      message: documents,
      status: 200
    });

  } catch (error) {
    console.error("Error in findAllFmsTasksForUser:", error);
    return res.status(500).json({ error: error.message });
  }
});

//ALL PENDING tasks
getFms.get('/finduserFmsTasks', async (req, res) => {
    try {

        const token = req.headers.authorization;
        
            if (!token) {
              return res.status(401).json({ message: "Authorization header missing" });
            }
        
            // ✅ Fetch actual user details from token
            const userDetails = await fetchUserDetails(token);

        const documents = await FmsTasks.find(
            {"fmsTaskDoers.empId": userDetails.result.emp_id, fmsTaskStatus: { $in: ["PENDING", "COMPLETED"] }}
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

// FindAllFMSMaster
getFms.get('/findAllFmsMaster', async (req, res) => {
  try {
    const token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({ message: "Authorization header missing" });
    }

    const documents = await FmsMaster.find({})
      .sort({ createdAt: -1 });

    res.json({
      message: documents,
      status: 200
    });

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: error.message });
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