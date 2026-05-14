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

    let { department, requestForm, fmsName } = req.query;

    // Build dynamic query
    const query = {};
console.log("Department from API:", department);

    if (department) {
      query.department = department;
    }

    if (requestForm) {
      query.requestForm = requestForm;
    }

    if(fmsName) {
      query.fmsName = fmsName;
    }

    // Fetch data based on filters
    const documents = await FmsMaster.find(query);
    const fmsqaAnswers = await FmsQA.find(query);
    const fmsTasks = await FmsTasks.find(query);

    const allDepartments = await FmsQA.find({}, { department: 1, _id: 0 });

console.log("All Departments:", allDepartments);

    console.log(
  "Departments from DB:",
  fmsqaAnswers.map((item) => item.department)
);
     console.log("FMS QA Details:", fmsqaAnswers);


    res.json({
      message: {
        fmsMaster: documents,
        fmsQA: fmsqaAnswers,
        fmsTasks: fmsTasks
      },
    });

  } catch (error) {
    console.error("Error in getfilterviewFms:", error);
    return res.status(500).json({ error: error.message });
  }
});

getfilterAdmin.get("/getviewdeptlist", async (req, res) => {
  try {
    const token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({ message: "Authorization header missing" });
    }

    const userDetails = await fetchUserDetails(token);

    // ✅ Fetch only distinct department values from FmsMaster
    const departments = await FmsMaster.distinct("department");

    res.json({
      message: {
        departments, // ✅ e.g. ["Admin", "HR", "Finance"]
      },
    });

  } catch (error) {
    console.error("Error in getviewdeptlist:", error);
    return res.status(500).json({ error: error.message });
  }
});


module.exports = getfilterAdmin;