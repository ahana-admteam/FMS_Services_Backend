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

    if (fmsName) {
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


// GET TASK REPORT

// getfilterAdmin.get("/getFmsTaskReport", async (req, res) => {

//   try {

//     const token = req.headers.authorization;

//     if (!token) {
//       return res.status(401).json({
//         message: "Authorization header missing",
//       });
//     }

//     // Validate User
//     await fetchUserDetails(token);

//     // ======================================================
//     // QUERY PARAMS
//     // ======================================================

//     let { department, requestForm, fmsName } = req.query;

//     const query = {};

//     if (department) {
//       query.department = department;
//     }

//     if (requestForm) {
//       query.requestForm = requestForm;
//     }

//     if (fmsName) {
//       query.fmsName = fmsName;
//     }

//     // ======================================================
//     // FETCH TASKS
//     // ======================================================

//     const tasks = await FmsTasks.find(query)
//       .sort({ fmsQAId: 1, fmsTaskId: 1 })
//       .lean();

//     // ======================================================
//     // FETCH QA DATA
//     // ======================================================

//     const qaIds = [...new Set(tasks.map((t) => t.fmsQAId))];

//     const qaData = await FmsQA.find({
//       fmsQAId: { $in: qaIds }
//     }).lean();

//     // ======================================================
//     // CREATE QA MAP
//     // ======================================================

//     const qaMap = {};

//     qaData.forEach((qa) => {
//       qaMap[qa.fmsQAId] = qa;
//     });

//     // ======================================================
//     // SUMMARY COUNTS (REQUEST LEVEL)
//     // ======================================================

//     let totalRequests = qaIds.length;

//     let onTimeRequests = [];
//     let delayedRequests = [];

//     // ======================================================
//     // GROUP DATA
//     // ======================================================

//     const groupedData = {};

//     tasks.forEach((task) => {

//       const qa = qaMap[task.fmsQAId];

//       let requestorName = "";
//       let empId = "";

//       // ======================================================
//       // GET REQUESTOR DETAILS
//       // ======================================================

//       if (qa && qa.fmsQA) {

//         const requestorNameField = qa.fmsQA.find(
//           (q) => q.question === "Requester Name"
//         );

//         const empIdField = qa.fmsQA.find(
//           (q) => q.question === "Requester Employee Id"
//         );

//         requestorName = requestorNameField?.answer || "";
//         empId = empIdField?.answer || "";
//       }

//       // ======================================================
//       // CREATE REQUEST GROUP
//       // ======================================================

//       if (!groupedData[task.fmsQAId]) {

//         // groupedData[task.fmsQAId] = {
//         //   fmsMasterId: task.fmsMasterId,
//         //   fmsQAId: task.fmsQAId,
//         //   fmsName: task.fmsName,
//         //   requestForm: task.requestForm,
//         //   department: task.department,
//         //   requestorName,
//         //   empId,

//         //   requestStatus: "ONTIME",

//         //   tasks: []
//         // };
//       groupedData[task.fmsQAId] = {
//   fmsMasterId: task.fmsMasterId,
//   fmsQAId: task.fmsQAId,
//   fmsName: task.fmsName,
//   requestForm: task.requestForm,
//   department: task.department,

//   requestorName,
//         empId,

//         requestSubmittedBy: qa?.fmsQACreatedBy?.empId || null,

//         requestSubmittedEmail: qa?.fmsQACreatedBy?.email || null,

//         requestSubmittedTime:
//           qa?.fmsQACreatedBy?.timestamp || null,

//         fmsStatus: qa?.fmsStatus || null,

//         fmsCompletionstatus:
//           qa?.fmsCompletionstatus || null,

//         fmsDelayTime:
//           qa?.fmsDelayTime || null,

//         tasks: []
//       };
//       }

//       // ======================================================
//       // TASK DELAY LOGIC
//       // ======================================================

//       let delayHours = 0;

//       if (task.fmsTaskCompletedStatus === "DELAY") {

//         groupedData[task.fmsQAId].requestStatus = "DELAY";

//         if (task.fmsTaskTimeDifference) {

//           const time = task.fmsTaskTimeDifference.replace("-", "");

//           const [hrs, mins, secs] = time.split(":").map(Number);

//           delayHours =
//             hrs + mins / 60 + secs / 3600;
//         }
//       }

//       // ======================================================
//       // PUSH TASKS
//       // ======================================================

//       groupedData[task.fmsQAId].tasks.push({

//         fmsTaskId: task.fmsTaskId,
//         stepId: task.stepId,

//         taskStatus: task.fmsTaskStatus,
//         completedStatus: task.fmsTaskCompletedStatus,

//         delayHours: Number(delayHours.toFixed(2)),

//         createdTime: task.fmsTaskCreatedTime,
//         startTime: task.fmsTaskStartTime,
//         completedTime: task.fmsTaskCompletedTime,

//         assignedTo: task.fmsTaskDoers || [],
//         completedBy: task.completedBy || null
//       });

//     });

//     // ======================================================
//     // FINAL DATA
//     // ======================================================

//     const finalData = Object.values(groupedData);

//     // ======================================================
//     // REQUEST LEVEL COUNTS
//     // ======================================================

//     finalData.forEach((request) => {

//       // if (request.requestStatus === "DELAY") {
//       if (request.fmsCompletionstatus === "DELAY") {

//         delayedRequests.push({
//           fmsQAId: request.fmsQAId,
//           requestorName: request.requestorName,
//           empId: request.empId,
//           // requestStatus: request.requestStatus
//           fmsStatus: request.fmsStatus,
//           fmsCompletionstatus: request.fmsCompletionstatus,
//           fmsDelayTime: request.fmsDelayTime
//         });

//       } else {

//         onTimeRequests.push({
//           fmsQAId: request.fmsQAId,
//           requestorName: request.requestorName,
//           empId: request.empId,
//           // requestStatus: request.requestStatus
//           fmsStatus: request.fmsStatus,
//           fmsCompletionstatus: request.fmsCompletionstatus,
//           fmsDelayTime: request.fmsDelayTime
//         });

//       }

//     });

//     // ======================================================
//     // AVG DELAY HOURS
//     // ======================================================

//     let totalDelayHours = 0;
//     let delayedTaskCount = 0;

//     tasks.forEach((task) => {

//       if (
//         task.fmsTaskCompletedStatus === "DELAY" &&
//         task.fmsTaskTimeDifference
//       ) {

//         const time = task.fmsTaskTimeDifference.replace("-", "");

//         const [hrs, mins, secs] = time.split(":").map(Number);

//         const delay =
//           hrs + mins / 60 + secs / 3600;

//         totalDelayHours += delay;

//         delayedTaskCount++;
//       }

//     });

//     const avgDelayHours =
//       delayedTaskCount > 0
//         ? Number((totalDelayHours / delayedTaskCount).toFixed(2))
//         : 0;

//     res.json({
//       message: {

//         summary: {

//           totalRequests,

//           onTimeRequestCount: onTimeRequests.length,
//           onTimeRequests,

//           delayedRequestCount: delayedRequests.length,
//           delayedRequests,

//           avgDelayHours
//         },

//         data: finalData
//       }
//     });

//   } catch (error) {

//     console.error("Error in getFmsTaskReport:", error);

//     return res.status(500).json({
//       error: error.message
//     });

//   }

// });
// GET TASK REPORT

getfilterAdmin.get("/getFmsTaskReport", async (req, res) => {

  try {

    const token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({
        message: "Authorization header missing",
      });
    }

    // Validate User
    await fetchUserDetails(token);

    // ======================================================
    // QUERY PARAMS
    // ======================================================

    let { department, requestForm, fmsName } = req.query;

    const query = {};

    if (department) {
      query.department = department;
    }

    if (requestForm) {
      query.requestForm = requestForm;
    }

    if (fmsName) {
      query.fmsName = fmsName;
    }

    // ======================================================
    // FETCH TASKS
    // ======================================================

    const tasks = await FmsTasks.find(query)
      .sort({ fmsQAId: 1, fmsTaskId: 1 })
      .lean();

    // ======================================================
    // FETCH QA DATA
    // ======================================================

    const qaIds = [...new Set(tasks.map((t) => t.fmsQAId))];

    const qaData = await FmsQA.find({
      fmsQAId: { $in: qaIds }
    }).lean();

    // ======================================================
    // CREATE QA MAP
    // ======================================================

    const qaMap = {};

    qaData.forEach((qa) => {
      qaMap[qa.fmsQAId] = qa;
    });

    // ======================================================
    // SUMMARY COUNTS
    // ======================================================

    let totalRequests = qaIds.length;

    // let onTimeRequests = [];
    // let delayedRequests = [];

    let ongoingRequests = [];

let onTimeCompletedRequests = [];

let delayedCompletedRequests = [];
    // ======================================================
    // GROUP DATA
    // ======================================================

    const groupedData = {};

    tasks.forEach((task) => {

      // ===================================
      // SKIP FIRST & LAST STEP
      // ===================================

      if (task.stepId === 1 || task.stepId === 9) {
        return;
      }

      const qa = qaMap[task.fmsQAId];

      let requestorName = "";
      let empId = "";

      // ======================================================
      // GET REQUESTOR DETAILS
      // ======================================================

      if (qa && qa.fmsQA) {

        const requestorNameField = qa.fmsQA.find(
          (q) => q.question === "Requester Name"
        );

        const empIdField = qa.fmsQA.find(
          (q) => q.question === "Requester Employee Id"
        );

        requestorName = requestorNameField?.answer || "";
        empId = empIdField?.answer || "";
      }

      // ======================================================
      // CREATE REQUEST GROUP
      // ======================================================

      if (!groupedData[task.fmsQAId]) {

        groupedData[task.fmsQAId] = {

          fmsMasterId: task.fmsMasterId,
          fmsQAId: task.fmsQAId,

          fmsName: task.fmsName,
          requestForm: task.requestForm,
          department: task.department,

          requestorName,
          empId,

          // ===================================
          // REQUEST SUBMITTED DETAILS
          // ===================================

          requestSubmittedBy:
            qa?.fmsQACreatedBy?.empId || null,

          requestSubmittedEmail:
            qa?.fmsQACreatedBy?.email || null,

          requestSubmittedTime:
            qa?.fmsQACreatedBy?.timestamp || null,

          // ===================================
          // REQUEST LEVEL STATUS
          // ===================================

          fmsStatus:
            qa?.fmsStatus || null,

          fmsCompletionstatus:
            qa?.fmsCompletionstatus || null,

          fmsDelayTime:
            qa?.fmsDelayTime || null,

          tasks: []
        };
      }

      // ======================================================
      // TASK DELAY LOGIC
      // ======================================================

      let delayHours = 0;

      if (
        task.fmsTaskCompletedStatus === "DELAY" &&
        task.fmsTaskTimeDifference
      ) {

        const time = task.fmsTaskTimeDifference.replace("-", "");

        const [hrs, mins, secs] = time.split(":").map(Number);

        delayHours =
          hrs + mins / 60 + secs / 3600;
      }

      // ======================================================
      // PUSH TASKS
      // ======================================================

      groupedData[task.fmsQAId].tasks.push({

        fmsTaskId: task.fmsTaskId,

        stepId: task.stepId,

        taskStatus: task.fmsTaskStatus,

        completedStatus:
          task.fmsTaskCompletedStatus,

        delayHours:
          Number(delayHours.toFixed(2)),

        createdTime:
          task.fmsTaskCreatedTime,

        startTime:
          task.fmsTaskStartTime,

        completedTime:
          task.fmsTaskCompletedTime,

        // ===================================
        // SINGLE ASSIGNED USER
        // ===================================

        assignedTo:
          task.assignedTo || null,

        completedBy:
          task.completedBy || null
      });

    });

    // ======================================================
    // FINAL DATA
    // ======================================================

    const finalData = Object.values(groupedData);

    // ======================================================
    // REQUEST LEVEL COUNTS
    // ======================================================

    // finalData.forEach((request) => {

    //   if (request.fmsCompletionstatus === "DELAY") {

    //     delayedRequests.push({

    //       fmsQAId: request.fmsQAId,

    //       requestorName:
    //         request.requestorName,

    //       empId:
    //         request.empId,

    //       fmsStatus:
    //         request.fmsStatus,

    //       fmsCompletionstatus:
    //         request.fmsCompletionstatus,

    //       fmsDelayTime:
    //         request.fmsDelayTime
    //     });

    //   } else {

    //     onTimeRequests.push({

    //       fmsQAId: request.fmsQAId,

    //       requestorName:
    //         request.requestorName,

    //       empId:
    //         request.empId,

    //       fmsStatus:
    //         request.fmsStatus,

    //       fmsCompletionstatus:
    //         request.fmsCompletionstatus,

    //       fmsDelayTime:
    //         request.fmsDelayTime
    //     });

    //   }

    // });
    finalData.forEach((request) => {

  const requestData = {

    fmsQAId: request.fmsQAId,

    requestorName:
      request.requestorName,

    empId:
      request.empId,

    fmsStatus:
      request.fmsStatus,

    fmsCompletionstatus:
      request.fmsCompletionstatus,

    fmsDelayTime:
      request.fmsDelayTime
  };

  // =========================================
  // ONGOING REQUESTS
  // =========================================

  if (
    request.fmsStatus === "ONGOING"
  ) {

    ongoingRequests.push(requestData);
  }

  // =========================================
  // COMPLETED - ONTIME
  // =========================================

  else if (
    request.fmsStatus === "COMPLETED" &&
    request.fmsCompletionstatus === "ONTIME"
  ) {

    onTimeCompletedRequests.push(requestData);
  }

  // =========================================
  // COMPLETED - DELAY
  // =========================================

  else if (
    request.fmsStatus === "COMPLETED" &&
    request.fmsCompletionstatus === "DELAY"
  ) {

    delayedCompletedRequests.push(requestData);
  }

});

    // ======================================================
    // AVG DELAY HOURS
    // ======================================================

    let totalDelayHours = 0;

    let delayedTaskCount = 0;

    tasks.forEach((task) => {

      if (
        task.fmsTaskCompletedStatus === "DELAY" &&
        task.fmsTaskTimeDifference
      ) {

        const time =
          task.fmsTaskTimeDifference.replace("-", "");

        const [hrs, mins, secs] =
          time.split(":").map(Number);

        const delay =
          hrs + mins / 60 + secs / 3600;

        totalDelayHours += delay;

        delayedTaskCount++;
      }

    });

    const avgDelayHours =
      delayedTaskCount > 0
        ? Number(
            (totalDelayHours / delayedTaskCount).toFixed(2)
          )
        : 0;

    // ======================================================
    // RESPONSE
    // ======================================================

    res.json({
      message: {

        // summary: {

        //   totalRequests,

        //   onTimeRequestCount:
        //     onTimeRequests.length,

        //   onTimeRequests,

        //   delayedRequestCount:
        //     delayedRequests.length,

        //   delayedRequests,

        //   avgDelayHours
        // },
summary: {

  totalRequests,

  // =====================================
  // ONGOING REQUESTS
  // =====================================

  ongoingRequests: {

    count:
      ongoingRequests.length,

    data:
      ongoingRequests
  },

  // =====================================
  // COMPLETED REQUESTS
  // =====================================

  completedRequests: {

    totalCompletedCount:

      onTimeCompletedRequests.length +
      delayedCompletedRequests.length,

    // ==========================
    // ONTIME COMPLETED
    // ==========================

    onTimeCompleted: {

      count:
        onTimeCompletedRequests.length,

      data:
        onTimeCompletedRequests
    },

    // ==========================
    // DELAY COMPLETED
    // ==========================

    delayedCompleted: {

      count:
        delayedCompletedRequests.length,

      data:
        delayedCompletedRequests
    }
  },

  avgDelayHours
},
        data: finalData
      }
    });

  } catch (error) {

    console.error(
      "Error in getFmsTaskReport:",
      error
    );

    return res.status(500).json({
      error: error.message
    });

  }

});

module.exports = getfilterAdmin;
