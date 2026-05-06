const express = require("express");
const getFmsTasks = express.Router();
let MongoClient = require('mongodb').MongoClient;
const axios = require('axios');
const moment = require('moment-timezone');
const { fetchUserDetails } = require("../../../helpers/fetchuserDetails");
// const { infoLogger, errorLogger } = require("../../../middleware/logger");

// MODELS
const FmsTasks = require("../../models/fmsTasks.model");
const FmsMaster = require("../../models/fmsMaster.model");
const FmsQA = require("../../models/fmsQA.model");


//find ALL FMS Tasks FOR A USER 
// getFmsTasks.get('/findAllFmsTasksForUser', async (req, res) => {
//   try {
//     const token = req.headers.authorization;

//     if (!token) {
//       return res.status(401).json({ message: "Authorization header missing" });
//     }

//     const userDetails = await fetchUserDetails(token);
//     let { fmsTaskStatus, fmsTaskCompletedStatus } = req.query;

//     const query = {
//       "fmsTaskDoers.empId": userDetails.result.emp_id
//     };

//     // Handle multiple values (comma separated)
//     if (fmsTaskStatus) {
//       query.fmsTaskStatus = { $in: fmsTaskStatus.split(",") };
//     }

//     if (fmsTaskCompletedStatus) {
//       query.fmsTaskCompletedStatus = { $in: fmsTaskCompletedStatus.split(",") };
//     }

//     const documents = await FmsTasks.find(query);

//     res.json({
//       message: documents,
//       status: 200
//     });

//   } catch (error) {
//     console.error("Error in findAllFmsTasksForUser:", error);
//     return res.status(500).json({ error: error.message });
//   }
// });


getFmsTasks.get('/findAllFmsTasksForUser', async (req, res) => {
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

    if (fmsTaskStatus) {
      query.fmsTaskStatus = { $in: fmsTaskStatus.split(",") };
    }

    if (fmsTaskCompletedStatus) {
      query.fmsTaskCompletedStatus = { $in: fmsTaskCompletedStatus.split(",") };
    }

    const documents = await FmsTasks.find(query);

    // Enrich each task with fmsQAId and requester employee ID from FmsQA collection
    const enrichedDocuments = await Promise.all(
      documents.map(async (task) => {
        const taskObj = task.toObject();

        const fmsQADoc = await FmsQA.findOne({ fmsQAId: taskObj.fmsQAId });

        if (fmsQADoc) {
          // Extract Request ID
          const requestId = fmsQADoc.fmsQAId;

          // Extract Requester Employee ID from fmsQA array
          const empIdEntry = fmsQADoc.fmsQA.find(
            (qa) => qa.question.trim().toLowerCase() === "requester employee id"
          );
          const requesterEmpId = empIdEntry ? empIdEntry.answer : null;

           const empNameEntry = fmsQADoc.fmsQA.find(
            (qa) => qa.question.trim().toLowerCase() === "requester name"
          );
          const requesterEmpName = empNameEntry ? empNameEntry.answer : null;

          return {
            ...taskObj,
            requestId,
            requesterEmpId,
            requesterEmpName
          };
        }

        return {
          ...taskObj,
          requestId: null,
          requesterEmpId: null,
        };
      })
    );

    res.json({
      message: enrichedDocuments,
      status: 200,
    });

  } catch (error) {
    console.error("Error in findAllFmsTasksForUser:", error);
    return res.status(500).json({ error: error.message });
  }
});


module.exports = getFmsTasks;

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

// GET COMPLETED + CURRENT STEP BY fmsQAId
getFmsTasks.get('/findFmsStepsById/:fmsQAId', async (req, res) => {
  try {

    const { fmsQAId } = req.params;

    // Completed Steps
  const completedSteps = await FmsTasks.find({
  fmsQAId: Number(fmsQAId),
  fmsTaskStatus: "COMPLETED"
}).sort({ stepId: 1 });


    // Current Step
    const currentStep = await FmsTasks.findOne({
      fmsQAId: Number(fmsQAId),
      fmsTaskStatus: { $in: ["PENDING", "INPROGRESS"] }
    }).sort({ stepId: 1 });


    res.json({
      completedSteps,
      currentStep,
      status: 200
    });

  } catch (error) {
    console.error("Error in findFmsStepsById:", error);
    return res.status(500).json({ error: error.message });
  }
});

// ASSIGN TASK (START BUTTON)
getFmsTasks.post('/assignFmsTask', async (req, res) => {
  try {

    const token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({ 
        message: "Authorization header missing" 
      });
    }

    // Get logged-in user
    const userDetails = await fetchUserDetails(token);

    const empId = userDetails.result.emp_id;
    const empName = userDetails.result.emp_name;

    const { fmsTaskId } = req.body;

    if (!fmsTaskId) {
      return res.status(400).json({
        message: "fmsTaskId is required"
      });
    }

    // Check task exists
    const task = await FmsTasks.findOne({
      fmsTaskId: Number(fmsTaskId)
    });

    if (!task) {
      return res.status(404).json({
        message: "Task not found"
      });
    }

    // Check if already assigned
    const alreadyAssigned = task.fmsTaskDoers?.some(
      (emp) => emp.empId === empId
    );

    let updateQuery = {
      $set: {
        fmsTaskStatus: "ASSIGNED",
        assignedTo: {
          empId,
          empName
        },
        fmsTaskStartTime: new Date()
      }
    };

    // Push only if not already present
    if (!alreadyAssigned) {
      updateQuery.$push = {
        fmsTaskDoers: {
          empId,
          empName,
          assignedAt: new Date()
        }
      };
    }

    // Update task
    const updatedTask = await FmsTasks.findOneAndUpdate(
      { fmsTaskId: Number(fmsTaskId) },
      updateQuery,
      { new: true }
    );

    res.json({
      message: "Task assigned successfully",
      assignedTo: {
        empId,
        empName
      },
      data: updatedTask,
      status: 200
    });

  } catch (error) {
    console.error("Error in assignFmsTask:", error);
    return res.status(500).json({ 
      error: error.message 
    });
  }
});

// DELEGATE TASK
getFmsTasks.post('/delegateFmsTask', async (req, res) => {
  try {
    const token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({
        message: "Authorization header missing"
      });
    }

    const userDetails = await fetchUserDetails(token);

    const loggedEmpId = userDetails.result.emp_id;
    const loggedEmpName = userDetails.result.emp_name;

    const { fmsTaskId, delegateEmpId, delegateEmpName, remarks } = req.body;

    if (!fmsTaskId || !delegateEmpId || !delegateEmpName) {
      return res.status(400).json({
        message: "fmsTaskId, delegateEmpId, delegateEmpName are required"
      });
    }

    const task = await FmsTasks.findOne({
      fmsTaskId: Number(fmsTaskId)
    });

    if (!task) {
      return res.status(404).json({
        message: "Task not found"
      });
    }

    //  Only ASSIGNED tasks can be delegated
    if (task.fmsTaskStatus !== "ASSIGNED") {
      return res.status(400).json({
        message: "Only ASSIGNED tasks can be delegated"
      });
    }

    // Prevent self-delegation
    if (task.assignedTo?.empId === delegateEmpId) {
      return res.status(400).json({
        message: "Task already assigned to this employee"
      });
    }

    const updatedTask = await FmsTasks.findOneAndUpdate(
      { fmsTaskId: Number(fmsTaskId) },
      {
        $set: {
          //  New owner
          assignedTo: {
            empId: delegateEmpId,
            empName: delegateEmpName
          },

          //  Delegation block
          delegation: {
            delegatedBy: {
              empId: loggedEmpId,
              empName: loggedEmpName
            },
            delegatedTo: {
              empId: delegateEmpId,
              empName: delegateEmpName
            },
            remarks: remarks || "",
            status: "PENDING",
            delegatedAt: new Date()
          }
        }
      },
      { new: true }
    );

    res.json({
      message: "Task delegated successfully",
      assignedTo: updatedTask.assignedTo,
      delegation: updatedTask.delegation,
      status: 200
    });

  } catch (error) {
    console.error("Error in delegateFmsTask:", error);
    return res.status(500).json({ error: error.message });
  }
});

// ACCEPT DELEGATION
getFmsTasks.post('/acceptDelegation', async (req, res) => {
  try {
    const token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({
        message: "Authorization header missing"
      });
    }

    const userDetails = await fetchUserDetails(token);
    const loggedEmpId = userDetails.result.emp_id;

    const { fmsTaskId } = req.body;

    if (!fmsTaskId) {
      return res.status(400).json({
        message: "fmsTaskId is required"
      });
    }

    const task = await FmsTasks.findOne({
      fmsTaskId: Number(fmsTaskId)
    });

    if (!task || !task.delegation) {
      return res.status(404).json({
        message: "Delegation not found"
      });
    }

    //  Only delegated user can accept
    if (task.delegation.delegatedTo.empId !== loggedEmpId) {
      return res.status(403).json({
        message: "Not authorized to accept this delegation"
      });
    }

    const updatedTask = await FmsTasks.findOneAndUpdate(
      { fmsTaskId: Number(fmsTaskId) },
      {
        $set: {
          "delegation.status": "ACCEPTED"
        }
      },
      { new: true }
    );

    res.json({
      message: "Delegation accepted",
      data: updatedTask,
      status: 200
    });

  } catch (error) {
    console.error("Error in acceptDelegation:", error);
    return res.status(500).json({ error: error.message });
  }
});

// REJECT DELEGATION
getFmsTasks.post('/rejectDelegation', async (req, res) => {
  try {
    const token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({
        message: "Authorization header missing"
      });
    }

    const userDetails = await fetchUserDetails(token);

    const loggedEmpId = userDetails.result.emp_id;

    const { fmsTaskId, remarks } = req.body;

    if (!fmsTaskId) {
      return res.status(400).json({
        message: "fmsTaskId is required"
      });
    }

    const task = await FmsTasks.findOne({
      fmsTaskId: Number(fmsTaskId)
    });

    if (!task || !task.delegation) {
      return res.status(404).json({
        message: "Delegation not found"
      });
    }

    // Only delegated user can reject
    if (task.delegation.delegatedTo.empId !== loggedEmpId) {
      return res.status(403).json({
        message: "Not authorized to reject this delegation"
      });
    }

    const updatedTask = await FmsTasks.findOneAndUpdate(
      { fmsTaskId: Number(fmsTaskId) },
      {
        $set: {
          // revert back to original owner
          assignedTo: task.delegation.delegatedBy,

          "delegation.status": "REJECTED",
          "delegation.rejectionRemarks": remarks || ""
        }
      },
      { new: true }
    );

    res.json({
      message: "Delegation rejected",
      data: updatedTask,
      status: 200
    });

  } catch (error) {
    console.error("Error in rejectDelegation:", error);
    return res.status(500).json({ error: error.message });
  }
});
module.exports = getFmsTasks;