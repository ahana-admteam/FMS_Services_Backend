const express = require("express");
const transferFmsTask = express.Router();
const moment = require('moment-timezone');

const { fetchUserDetails } = require("../../../helpers/fetchuserDetails");
const { infoLogger, errorLogger } = require("../../../middleware/logger");

const FmsTasks = require("../../models/fmsTasks.model");

const { getRequestContext } = require("../utils/requestContext");

const context = getRequestContext();

console.log(context.empName);
console.log(context.empId);
console.log(context.token);

transferFmsTask.post("/transferFmsTask", async (req, res) => {
  try {
    const userDetails = await fetchUserDetails(req.headers.authorization);
    const { userName, userID, companyUrl, userEmail } = userDetails;

    infoLogger.log(
      "info",
      `Username:${userName} from company:${companyUrl} hit the api transferFmsTask with body params: ${JSON.stringify(req.body)}`
    );

    const taskIdToTransfer = req.body.task?.fmsTaskId;

    if (!taskIdToTransfer) {
      return res.status(400).json({ error: 'Missing task.fmsTaskId' });
    }

    const taskDocument = await FmsTasks.findOne({ fmsTaskId: taskIdToTransfer });

    if (!taskDocument) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Use new collection fields: isTranferredTo, fmsTaskDoer.empId
    if (taskDocument.isTranferredTo === true) {
      return res.status(400).json({ error: 'Task has already been transferred' });
    }

    if (!req.body.fmsTransferredToUser) {
      return res.status(400).json({ error: 'Missing fmsTransferredToUser' });
    }

    const currentDoerId = taskDocument.fmsTaskDoer?.empId || taskDocument.fmsTaskDoer?.employeeId || taskDocument.fmsTaskDoer?.empId;
    const targetDoerId = req.body.fmsTransferredToUser?.empId || req.body.fmsTransferredToUser?.employeeId || req.body.fmsTransferredToUser?.empId;

    if (targetDoerId === currentDoerId) {
      return res.status(400).json({ error: 'Task cannot be transferred to the same doer' });
    }

    const lastDoc = await FmsTasks.findOne().sort({ fmsTaskId: -1 });
    const newFmsTaskId = lastDoc ? lastDoc.fmsTaskId + 1 : 1;

    const currentDate = moment().tz('Asia/Kolkata').format();

    // Normalize incoming transferred-to user to new schema (empId/empName)
    const toUser = req.body.fmsTransferredToUser || {};
    const normalizedDoer = {
      empId: toUser.empId || toUser.employeeId || toUser.empId,
      empName: toUser.empName || toUser.employeeName || toUser.empName
    };

    const newTask = {
      fmsTaskId: newFmsTaskId,
      fmsQAId: req.body.task.fmsQAId,
      fmsQACreatedBy: taskDocument.fmsQACreatedBy || req.body.task.fmsQACreatedBy,
      fmsMasterId: req.body.task.fmsMasterId,
      fmsName: req.body.task.fmsName,
      fmsQA: req.body.task.fmsQA,
      fmsTaskDoer: normalizedDoer,
      fmsTaskStatus: "OVERDUE",
      fmsTaskCompletedStatus: req.body.task.fmsTaskCompletedStatus,
      fmsProcessID: req.body.task.fmsProcessID,
      plannedDate: req.body.task.plannedDate,
      what: req.body.task.what,
      how: req.body.task.how,
      stepId: req.body.task.stepId,
      stepType: req.body.task.stepType,
      fmsTaskCreatedTime: currentDate,
      fmsTaskPlannedCompletionTime: req.body.task.fmsTaskPlannedCompletionTime,
      formStepsAnswers: null,
      fmsTaskQualityDetails: null,
      // New schema uses isTransferredFrom / isTranferredTo booleans and transferredFromTaskId/transferredToTaskId
      isTransferredFrom: true,
      isTranferredTo: false,
      transferredFromTaskId: taskDocument.fmsTaskId,
      transferredToTaskId: null,
      transferredBy: { userID, userName, userEmail }
    };

    await FmsTasks.create(newTask);

    // Update original task to indicate it was transferred to the new task id
    await FmsTasks.updateOne(
      { fmsTaskId: taskDocument.fmsTaskId },
      { $set: { isTranferredTo: true, transferredToTaskId: newFmsTaskId } }
    );

    infoLogger.log("info", `Username:${userName} from company:${companyUrl} transferred task ${taskDocument.fmsTaskId} to ${JSON.stringify(req.body.fmsTransferredToUser)}`);

    return res.json({ message: "Task transferred successfully", status: 200 });
  } catch (error) {
    console.error("Error in transferFmsTask:", error);
    errorLogger.log("error", `Error transferring task: ${error.message}`);
    return res.status(500).json({ error: error.message });
  }
});

module.exports = transferFmsTask;
