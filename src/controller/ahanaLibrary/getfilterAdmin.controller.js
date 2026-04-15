const express = require("express");
const getfilterAdmin = express.Router();
const axios = require("axios");

const { fetchUserDetails } = require("../../../helpers/fetchuserDetails");
const { infoLogger, errorLogger } = require("../../../middleware/logger");

// MODELS
const FmsTasks = require("../../models/fmsTasks.model");
const FmsMaster = require("../../models/fmsMaster.model");
const FmsQA = require("../../models/fmsQA.model");

getfilterAdmin.get("/getfilterAdmin", async (req, res) => {
  try {

    let userDetails = await fetchUserDetails(req.headers.authorization);
    let userName = userDetails.userName;

    let {
      status,
      processId,
      employeeId,
      select_date,
      week_no,
      selectStart_daterange,
      selectEnd_daterange,
    } = req.query;

    if (status !== undefined) {
      status = status.toUpperCase();
    }

    infoLogger.log(
      "info",
      `Username:${userName} hit getfilterAdmin with params ${JSON.stringify(
        req.query
      )}`
    );

    const query = {};

    if (status) query.fmsTaskStatus = status;
    if (processId)
      query["fmsProcessID.processId"] = parseInt(processId);

    if (employeeId)
      query["fmsTaskDoer.employeeId"] = parseInt(employeeId);

    // Single Date Filter
    if (select_date) {
      const startOfDay = new Date(select_date);
      startOfDay.setUTCHours(0, 0, 0, 0);

      const endOfDay = new Date(select_date);
      endOfDay.setUTCHours(23, 59, 59, 999);

      query.fmsTaskPlannedCompletionTime = {
        $gte: startOfDay,
        $lt: endOfDay,
      };
    }

    // Date Range Filter
    if (selectStart_daterange && selectEnd_daterange) {
      const startOfRange = new Date(selectStart_daterange);
      startOfRange.setUTCHours(0, 0, 0, 0);

      const endOfRange = new Date(selectEnd_daterange);
      endOfRange.setUTCHours(23, 59, 59, 999);

      query.fmsTaskPlannedCompletionTime = {
        $gte: startOfRange,
        $lte: endOfRange,
      };
    }

    // Week Filter
    if (week_no) {
      try {

        const response = await axios.post(
          process.env.MAIN_BE_STARTDAY_WEEK_URL,
          {}
        );

        const responseResults = response.data.result;

        const matchingWeek = responseResults.find(
          (week) => week.weekNo === parseInt(week_no)
        );

        if (matchingWeek) {
          const startOfWeek = new Date(matchingWeek.weekStartingDate);
          startOfWeek.setUTCHours(0, 0, 0, 0);

          const endOfWeek = new Date(startOfWeek);
          endOfWeek.setDate(startOfWeek.getDate() + 6);
          endOfWeek.setUTCHours(23, 59, 59, 999);

          query.fmsTaskPlannedCompletionTime = {
            $gte: startOfWeek,
            $lte: endOfWeek,
          };
        } else {
          return res.status(400).json({
            error: "Invalid week_no provided",
          });
        }
      } catch (error) {
        return res.status(500).json({
          error: error.message,
        });
      }
    }

    // Using Model Instead of Mongo Collection
    const taskDocuments = await FmsTasks.find(query);

    console.log("Task Documents:", taskDocuments);

    res.status(200).json({
      message: taskDocuments,
      status: 200,
    });

  } catch (error) {
    console.error("Error:", error);

    errorLogger.log(
      "error",
      `Failed to fetch admin filtered fms data due to ${error.message}`
    );

    return res.status(500).json({
      error: error.message,
    });
  }
});

module.exports = getfilterAdmin;