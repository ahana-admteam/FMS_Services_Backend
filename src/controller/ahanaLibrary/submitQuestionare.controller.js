const express = require("express");
const submitFmsQuestionare = express.Router();
const moment = require("moment");

const { CurrentIST } = require("../../../helpers/convertGMTtoIST");
const { calculateFmsPlannedCompletionTime } = require("../../../helpers/calculateFmsPlannedCompleationTime");
const { infoLogger } = require("../../../middleware/logger");

//CONFIG
const { user } = require("../../config/configData");
const { userName, userID, companyUrl, userEmail } = user;

//MODELS
const FmsQA = require("../../models/fmsQA.model");
const FmsMaster = require("../../models/fmsMaster.model");
const FmsTasks = require("../../models/fmsTasks.model");

/**
 * @swagger
 * /submitQA/submitFmsUserQAcreateTaskStep1:
 *   post:
 *     summary: Submit FMS QA and create Task Step 1
 */
submitFmsQuestionare.post('/submitFmsUserQAcreateTaskStep1', async (req, res) => {
  try {
    console.log(req.body);

    infoLogger.log("info",
      `User:${userName} | Company:${companyUrl} | API: submitFmsUserQAcreateTaskStep1 | Body:${JSON.stringify(req.body)}`
    );

    // Generate fmsQAId
    const lastDoc = await FmsQA.findOne().sort({ fmsQAId: -1 });
    const fmsQAId = lastDoc ? lastDoc.fmsQAId + 1 : 1;

    // Insert QA
    await FmsQA.create({
      fmsQAId,
      fmsQACreatedBy: { userID, userEmail, userName },
      fmsMasterId: req.body.fmsMasterID,
      fmsName: req.body.fmsName,
      fmsQA: req.body.fmsQA,
      fmsQAisLive: true
    });

    // Update fmsMaster count
    await FmsMaster.findOneAndUpdate(
      { fmsMasterId: req.body.fmsMasterID },
      { $inc: { noOfLive: 1 } }
    );

    // Fetch fmsMaster
    const fmsMaster = await FmsMaster.findOne({
      fmsMasterId: req.body.fmsMasterID
    });

    if (!fmsMaster) {
      return res.status(404).json({ message: "fmsMaster not found" });
    }

    // Step Logic
    const firstStep = fmsMaster.fmsSteps[0];

    if (firstStep.plannedDate.type !== "T-X") {
      await createInitialTask(fmsMaster, req, fmsQAId);
      await nextP2Psteps(fmsMaster, fmsMaster.fmsSteps, firstStep.id, fmsQAId);
    } else {
      const txSteps = fmsMaster.fmsSteps.filter(
        step => step.plannedDate.type === "T-X"
      );

      if (txSteps.length > 0) {
        await createTxSteps(fmsMaster, txSteps, fmsQAId, req.body.fmsQA);
      }
    }

    return res.json({
      message: "Requester form submitted and Step 1 task created",
      status: 200
    });

  } catch (error) {
    console.error("Error in API:", error);
    return res.status(500).json({ error: error.message });
  }
});


//Create Initial Task
async function createInitialTask(fmsMaster, req, fmsQAId) {
  try {
    const step = fmsMaster.fmsSteps[0];

    const lastDoc = await FmsTasks.findOne().sort({ fmsTaskId: -1 });
    const fmsTaskId = lastDoc ? lastDoc.fmsTaskId + 1 : 1;

    // const plannedTime = await calculateFmsPlannedCompletionTime(
    //   companyUrl,
    //   step.plannedDate.duration,
    //   step.plannedDate.durationType,
    //   step.plannedDate.working,
    //   step.plannedDate.endTime,
    //   step.plannedDate.type,
    //   null,
    //   CurrentIST()
    // );
    const plannedTime = new Date();
    const currentDate = moment().tz('Asia/Kolkata').format();

    await FmsTasks.create({
      fmsTaskId,
      fmsQAId,
      fmsMasterId: req.body.fmsMasterID,
      fmsName: req.body.fmsName,
      fmsTaskDoer: step.who.employees[0],
      fmsTaskStatus: "PENDING",
      fmsProcessID: fmsMaster.fmsProcess,
      plannedDate: step.plannedDate,
      what: step.what,
      how: step.how,
      stepId: step.id,
      stepType: step.stepType,
      startTimeType: step.startTimeType,
      fmsTaskCreatedTime: currentDate,
      fmsTaskStartTime: currentDate,
      fmsTaskPlannedCompletionTime: plannedTime
    });

  } catch (error) {
    console.error("Error creating initial task:", error);
  }
}


//Handle P2P Steps
async function nextP2Psteps(fmsMaster, steps, startId, fmsQAId) {
  let current = steps.find(s => s.id === startId);
  let isFirst = true;

  while (current) {
    if (current.startTimeType === 'P2P' && !isFirst) {
      await createP2PTask(fmsMaster, current, fmsQAId);
    }

    if ((current.startTimeType === 'A2P' && !isFirst) || current.endStep) break;

    isFirst = false;
    current = steps.find(s => s.id === current.next?.[0]?.id);
  }
}


//Create P2P Task
async function createP2PTask(fmsMaster, step, fmsQAId) {
  try {
    const lastDoc = await FmsTasks.findOne().sort({ fmsTaskId: -1 });
    const fmsTaskId = lastDoc ? lastDoc.fmsTaskId + 1 : 1;

    const currentDate = moment().tz('Asia/Kolkata').format();

    await FmsTasks.create({
      fmsTaskId,
      fmsQAId,
      fmsMasterId: fmsMaster.fmsMasterId,
      fmsName: fmsMaster.fmsName,
      fmsTaskDoer: step.who.employees[0],
      fmsTaskStatus: "PENDING",
      fmsProcessID: step.processId,
      plannedDate: step.plannedDate,
      what: step.what,
      how: step.how,
      stepId: step.id,
      stepType: step.stepType,
      startTimeType: step.startTimeType,
      fmsTaskCreatedTime: currentDate
    });

  } catch (error) {
    console.error("Error creating P2P task:", error);
  }
}


//Handle T-X Steps
async function createTxSteps(fmsMaster, steps, fmsQAId, fmsQA) {
  for (let step of steps) {
    try {
      const lastDoc = await FmsTasks.findOne().sort({ fmsTaskId: -1 });
      const fmsTaskId = lastDoc ? lastDoc.fmsTaskId + 1 : 1;

      const plannedTime = await calculateFmsPlannedCompletionTime(
        companyUrl,
        step.plannedDate.duration,
        step.plannedDate.durationType,
        step.plannedDate.working,
        step.plannedDate.endTime,
        step.plannedDate.type,
        fmsQA[0]?.answer,
        CurrentIST()
      );

      const currentDate = moment().tz('Asia/Kolkata').format();

      await FmsTasks.create({
        fmsTaskId,
        fmsQAId,
        fmsMasterId: fmsMaster.fmsMasterId,
        fmsName: fmsMaster.fmsName,
        fmsTaskDoer: step.who.employees[0],
        fmsTaskStatus: "PENDING",
        plannedDate: step.plannedDate,
        what: step.what,
        how: step.how,
        stepId: step.id,
        stepType: step.stepType,
        startTimeType: step.startTimeType,
        fmsTaskCreatedTime: currentDate,
        fmsTaskPlannedCompletionTime: plannedTime
      });

    } catch (error) {
      console.error("Error creating T-X task:", error);
    }
  }
}

module.exports = submitFmsQuestionare;