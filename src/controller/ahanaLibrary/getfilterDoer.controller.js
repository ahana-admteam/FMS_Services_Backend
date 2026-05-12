const express = require("express");
const getfilterDoer = express.Router();
const axios = require("axios");

const { fetchUserDetails } = require("../../../helpers/fetchuserDetails");
const { infoLogger, errorLogger } = require("../../../middleware/logger");

// MODELS
const FmsTasks = require("../../models/fmsTasks.model");
const FmsMaster = require("../../models/fmsMaster.model");
const FmsQA = require("../../models/fmsQA.model");

getfilterDoer.get("/getfilterDoer", async (req, res) => {
  try {
      const token = req.headers.authorization;
  
      if (!token) {
        return res.status(401).json({ message: "Authorization header missing" });
      }
  
      // Fetch user details
      const userDetails = await fetchUserDetails(token);

  
      let { department, requestForm, fmsName } = req.query;
  
      // Build dynamic query
      const query = {"fmsTaskDoer.empId": userDetails.result.emp_id};
  
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

getfilterDoer.post("/getFmsrequestform", async (req, res) => {
  try {
    const token = req.headers.authorization;
    const { department } = req.body; // ✅ get from body

    if (!token) {
      return res.status(401).json({ message: "Authorization header missing" });
    }

    const userDetails = await fetchUserDetails(token);

    if (!userDetails?.result?.emp_id) {
      return res.status(401).json({ message: "Invalid user details" });
    }

    const empId = userDetails.result.emp_id;

    // ✅ Build filter
    let filter = {
      "requestFormAccess.empId": empId
    };

    if (department) {
      filter.department = department;
    }

    const documents = await FmsMaster.find(
      filter,
      {
        fmsMasterId: 1,
        fmsName: 1,
        fmsDescription: 1,
        requestForm: 1,
        department: 1,
        _id: 0
      }
    ).lean();

    return res.status(200).json({
      success: true,
      data: documents
    });

  } catch (error) {
    console.error("Error in getFmsrequestform:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    });
  }
});

//  getfilterDoer.get("/getmyRequests", async (req, res) => {
//   try {
//     const token = req.headers.authorization;

//     if (!token) {
//       return res.status(401).json({ message: "Authorization header missing" });
//     }

//     // Fetch user details
//     const userDetails = await fetchUserDetails(token);
//     const empId = userDetails.result.emp_id;

//     let { department, requestForm } = req.body;

//     // ✅ Correct query: match fmsQA array element where question is Employee Id AND answer matches logged-in user
//     const fmsQAQuery = {
//       fmsQA: {
//         $elemMatch: {
//           question: { $regex: /Requester Employee Id/i }, // case-insensitive match
//           answer: { $regex: new RegExp(`^${empId}$`, "i") } // handles "AS01989" vs "As01989"
//         }
//       }
//     };

//     if (department) {
//       fmsQAQuery.department = department;
//     }

//     if (requestForm) {
//       fmsQAQuery.requestForm = requestForm;
//     }

//     // Fetch all QA records raised by this employee
//     const fmsqaAnswers = await FmsQA.find(fmsQAQuery);

//     if (!fmsqaAnswers.length) {
//       return res.json({
//         message: {
//           requests: []
//         }
//       });
//     }

//     // ✅ Get all fmsQAIds from the matched QA records
//     const fmsQAIds = fmsqaAnswers.map((qa) => qa.fmsQAId);

//     // ✅ Fetch tasks where fmsQAId matches — same fmsQAId links QA and Task
//     const taskQuery = { fmsQAId: { $in: fmsQAIds } };

//     if (department) {
//       taskQuery.department = department;
//     }

//     if (requestForm) {
//       taskQuery.requestForm = requestForm;
//     }

//     const fmsTasks = await FmsTasks.find(taskQuery);

//     // ✅ Build a map of tasks keyed by fmsQAId for easy lookup
//     const tasksByQAId = {};
//     fmsTasks.forEach((task) => {
//       if (!tasksByQAId[task.fmsQAId]) {
//         tasksByQAId[task.fmsQAId] = [];
//       }
//       tasksByQAId[task.fmsQAId].push({
//         fmsTaskId: task.fmsTaskId,
//         what: task.what,               // ✅ The task "what" (e.g. "Request for book")
//         fmsTaskStatus: task.fmsTaskStatus,           // ✅ e.g. "COMPLETED"
//         fmsTaskCompletedStatus: task.fmsTaskCompletedStatus, // e.g. "ONTIME"
//       });
//     });

//     // ✅ Combine QA + Task details into one clean response
//     const requests = fmsqaAnswers.map((qa) => {
//       // Extract key fields from fmsQA array
//       const getAnswer = (questionRegex) => {
//         const found = qa.fmsQA.find((q) => questionRegex.test(q.question));
//         return found ? found.answer : null;
//       };

//       return {
//         fmsQAId: qa.fmsQAId,
//         fmsName: qa.fmsName,
//         department: qa.department,           // ✅ Department name
//         requestForm: qa.requestForm,         // ✅ Request form name
//         requesterName: getAnswer(/Requester Name/i),
//         requesterEmail: getAnswer(/Mail Id/i),
//         requesterEmpId: getAnswer(/Employee Id/i),
//         book1stPreference: getAnswer(/1st Preference/i),
//         book2ndPreference: getAnswer(/2nd Preference/i),
//         tasks: tasksByQAId[qa.fmsQAId] || []  // ✅ Matched tasks with what + status
//       };
//     });

//     res.json({
//       message: {
//         requests
//       }
//     });

//   } catch (error) {
//     console.error("Error in getmyRequests:", error);
//     return res.status(500).json({ error: error.message });
//   }
// });

getfilterDoer.get("/getmyRequests", async (req, res) => {
  try {
    const token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({ message: "Authorization header missing" });
    }

    const userDetails = await fetchUserDetails(token);
    const empId = userDetails.result.emp_id;

    let { department, requestForm } = req.body;

    const fmsQAQuery = {
      fmsQA: {
        $elemMatch: {
          question: { $regex: /Requester Employee Id/i },
          answer: { $regex: new RegExp(`^${empId}$`, "i") }
        }
      }
    };

    if (department) {
      fmsQAQuery.department = department;
    }

    if (requestForm) {
      fmsQAQuery.requestForm = requestForm;
    }

    const fmsqaAnswers = await FmsQA.find(fmsQAQuery);

    if (!fmsqaAnswers.length) {
      return res.json({ message: { requests: [] } });
    }

    const fmsQAIds = fmsqaAnswers.map((qa) => qa.fmsQAId);

    // ✅ Collect all unique fmsMasterIds to fetch master data in one query
    const fmsMasterIds = [...new Set(fmsqaAnswers.map((qa) => qa.fmsMasterId))];

    const taskQuery = { fmsQAId: { $in: fmsQAIds } };

    if (department) taskQuery.department = department;
    if (requestForm) taskQuery.requestForm = requestForm;

    // ✅ Fetch tasks and FmsMaster records in parallel
    const [fmsTasks, fmsMasterRecords] = await Promise.all([
      FmsTasks.find(taskQuery),
      FmsMaster.find({ fmsMasterId: { $in: fmsMasterIds } })
    ]);

    // ✅ Build a map of FmsMaster keyed by fmsMasterId for easy lookup
    const masterByMasterId = {};
    fmsMasterRecords.forEach((master) => {
      masterByMasterId[master.fmsMasterId] = master;
    });

    // ✅ Build a map of tasks keyed by fmsQAId
    const tasksByQAId = {};
    fmsTasks.forEach((task) => {
      if (!tasksByQAId[task.fmsQAId]) {
        tasksByQAId[task.fmsQAId] = [];
      }
      tasksByQAId[task.fmsQAId].push({
        fmsTaskId: task.fmsTaskId,
        what: task.what,
        fmsTaskStatus: task.fmsTaskStatus,
        fmsTaskCompletedStatus: task.fmsTaskCompletedStatus,
        fmsTaskStepStatus: task.fmsTaskStepStatus ?? null,
      });
    });

    const getAnswer = (fmsQAArray, questionRegex) => {
      const found = fmsQAArray.find((q) => questionRegex.test(q.question));
      return found ? found.answer : null;
    };

    // ✅ Combine QA + Task + BookAvailability into one response
    const requests = fmsqaAnswers.map((qa) => {
      const masterRecord = masterByMasterId[qa.fmsMasterId];

      // ✅ Get requested books from QA answers
      const book1st = getAnswer(qa.fmsQA, /1st Preference/i);
      const book2nd = getAnswer(qa.fmsQA, /2nd Preference/i);

      // ✅ Match book availability from master for requested books
      const bookAvailability = masterRecord?.BookAvaliblity || [];

      const getBookAvailability = (bookName) => {
        if (!bookName) return null;
        const match = bookAvailability.find(
          (b) => b.BookName.toLowerCase().trim() === bookName.toLowerCase().trim()
        );
        return match
          ? { bookName: match.BookName, availableCount: match.Count }
          : { bookName, availableCount: 0 }; // ✅ Book not found in master = 0
      };

      return {
        fmsQAId: qa.fmsQAId,
        fmsName: qa.fmsName,
        department: qa.department,
        requestForm: qa.requestForm,
        requesterName: getAnswer(qa.fmsQA, /Requester Name/i),
        requesterEmail: getAnswer(qa.fmsQA, /Mail Id/i),
        requesterEmpId: getAnswer(qa.fmsQA, /Employee Id/i),
        book1stPreference: book1st,
        book2ndPreference: book2nd,
        bookAvailability: bookAvailability,
        tasks: tasksByQAId[qa.fmsQAId] || []
      };
    });

    res.json({ message: { requests } });

  } catch (error) {
    console.error("Error in getmyRequests:", error);
    return res.status(500).json({ error: error.message });
  }
});

module.exports = getfilterDoer;