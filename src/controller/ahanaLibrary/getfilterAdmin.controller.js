const express = require("express");
const getfilterAdmin = express.Router();
const axios = require("axios");
const { fetchUserDetails } = require("../../../helpers/fetchuserDetails");


// MODELS
const FmsTasks = require("../../models/fmsTasks.model");
const FmsMaster = require("../../models/fmsMaster.model");
const FmsQA = require("../../models/fmsQA.model");


getfilterAdmin.get("/getfilterviewFms", async (req, res) => {
  try {
    const token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({ message: "Authorization header missing" });
    }

    // Fetch user details
    const userDetails = await fetchUserDetails(token);

    let { department, requestForm } = req.query;

    // Build dynamic query
    const query = {};

    if (department) {
      query.department = department;
    }

    if (requestForm) {
      query.requestForm = requestForm;
    }

    // Fetch data based on filters
    const documents = await FmsMaster.find(query);

    res.json({
      message: documents,
      status: 200
    });

  } catch (error) {
    console.error("Error in getfilterviewFms:", error);
    return res.status(500).json({ error: error.message });
  }
});


module.exports = getfilterAdmin;