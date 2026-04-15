const express = require("express");
const getfilterfmsDept = express.Router();

const { fetchUserDetails } = require("../../../helpers/fetchuserDetails");
const { infoLogger, errorLogger } = require("../../../middleware/logger");

// MODELS
const FmsTasks = require("../../models/fmsTasks.model");
const FmsMaster = require("../../models/fmsMaster.model");
const FmsQA = require("../../models/fmsQA.model");

getfilterfmsDept.get("/getfilterfmsDept", async (req, res) => {
  try {

    let userDetails = await fetchUserDetails(req.headers.authorization);
    let userName = userDetails.userName;

    let { dept_id } = req.query;

    infoLogger.log(
      "info",
      `Username: ${userName} hit getfilterfmsDept with params ${JSON.stringify(
        req.query
      )}`
    );

    const query = { fmsLive: true };

    if (dept_id) {
      query["fmsProcess.deptId"] = parseInt(dept_id);
    }

    // Using Model instead of collection
    const Deptemplist = await FmsMaster.find(query);

    console.log("Deptemplist:", Deptemplist);

    res.status(200).json({
      message: Deptemplist,
      status: 200,
    });

  } catch (error) {
    errorLogger.log(
      "error",
      `Failed to fetch dept filtered fms data due to ${error.message}`
    );

    console.error("Error", error);

    return res.status(500).json({
      error: error.message,
    });
  }
});

module.exports = getfilterfmsDept;