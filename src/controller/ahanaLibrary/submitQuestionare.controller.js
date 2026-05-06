const express = require("express");
const submitQuestionare = express.Router();
const moment = require("moment");
const { CurrentIST } = require("../../../helpers/convertGMTtoIST");
const { calculateFmsPlannedCompletionTime } = require("../../../helpers/calculateFmsPlannedCompleationTime");
const { fetchUserDetails } = require("../../../helpers/fetchuserDetails");

// MODELS
const FmsQA = require("../../models/fmsQA.model");
const FmsMaster = require("../../models/fmsMaster.model");
const FmsTasks = require("../../models/fmsTasks.model");

// ─── Validation Helper ────────────────────────────────────────────────────────
function validateSubmitPayload(body) {
  const errors = [];

  if (!body.fmsMasterID) errors.push("fmsMasterID is required");
  if (!body.fmsName || typeof body.fmsName !== "string") errors.push("fmsName is required");
  if (!body.requestForm || typeof body.requestForm !== "string") errors.push("requestForm is required");
  if (!body.department || typeof body.department !== "string") errors.push("department is required");

  if (!Array.isArray(body.fmsQA) || body.fmsQA.length === 0) {
    errors.push("fmsQA must be a non-empty array");
  } else {
    body.fmsQA.forEach((qa, index) => {
      if (!qa.id) errors.push(`fmsQA[${index}].id is required`);
      if (!qa.question || typeof qa.question !== "string") errors.push(`fmsQA[${index}].question is required`);
      if (qa.required && (qa.answer === undefined || qa.answer === null || qa.answer === ""))
        errors.push(`fmsQA[${index}].answer is required (question: "${qa.question}")`);
      if (!qa.answerType) errors.push(`fmsQA[${index}].answerType is required`);
    });
  }

  return errors;
}

// ─── Main Route ───────────────────────────────────────────────────────────────
submitQuestionare.post('/submitFmsUserQAcreateTaskStep1', async (req, res) => {
  try {
    const token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({ message: "Authorization header missing" });
    }

    const userDetails = await fetchUserDetails(token);
    const { emp_id, email_id } = userDetails.result;

    const triggeredBy = { empId: emp_id, email: email_id };

    // ✅ Validate request body
    const validationErrors = validateSubmitPayload(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({ message: "Validation failed", errors: validationErrors });
    }

    // ✅ Generate fmsQAId
    const lastQADoc = await FmsQA.findOne().sort({ fmsQAId: -1 });
    const fmsQAId = lastQADoc ? lastQADoc.fmsQAId + 1 : 1;

    // ✅ Save QA record
    await FmsQA.create({
      fmsQAId,
      fmsQACreatedBy: triggeredBy,
      fmsMasterId: req.body.fmsMasterID,
      fmsName: req.body.fmsName,
      requestForm: req.body.requestForm,
      department: req.body.department,
      fmsQA: req.body.fmsQA,
    });

    // ✅ Fetch fmsMaster
    const fmsMaster = await FmsMaster.findOne({ fmsMasterId: req.body.fmsMasterID });
    if (!fmsMaster) {
      return res.status(404).json({ message: "fmsMaster not found for given fmsMasterID" });
    }

    if (!Array.isArray(fmsMaster.fmsSteps) || fmsMaster.fmsSteps.length === 0) {
      return res.status(400).json({ message: "fmsMaster has no steps defined" });
    }

    const firstStep = fmsMaster.fmsSteps[0]; // step 1

    if (firstStep.plannedDate.type === "T-X") {
      // ─── T-X: create all T-X steps upfront ──────────────────────────────
      const txSteps = fmsMaster.fmsSteps.filter(s => s.plannedDate.type === "T-X");
      await createTxSteps(fmsMaster, txSteps, fmsQAId, req.body.fmsQA, triggeredBy);

    } else {
      // ─── A2P / P2P: create only Step 1 now ──────────────────────────────
      // Step 1 doers come from fmsSteps[0].who (direct array)
      const step1Doers = firstStep.who?.length > 0 ? firstStep.who : [triggeredBy];
      await createStepTask(fmsMaster, firstStep, fmsQAId, step1Doers, triggeredBy, req.body);
    }

    return res.json({
      message: "Requester form submitted and Step 1 task created",
      status: 200
    });

  } catch (error) {
    console.error("Error in submitFmsUserQAcreateTaskStep1:", error);
    return res.status(500).json({ error: error.message });
  }
});


// ─── Create Any Single Step Task ─────────────────────────────────────────────
// ✅ Reusable for Step 1 (A2P), P2P, and future on-demand step creation
async function createStepTask(fmsMaster, step, fmsQAId, doers, triggeredBy, reqBody = null) {
  try {
    const lastDoc = await FmsTasks.findOne().sort({ fmsTaskId: -1 });
    const fmsTaskId = lastDoc ? lastDoc.fmsTaskId + 1 : 1;

    const currentDate = moment().tz('Asia/Kolkata').format();

    // ✅ Calculate planned completion time
    const plannedTime = await calculateFmsPlannedCompletionTime(
      step.plannedDate.duration,
      step.plannedDate.durationType,
      step.plannedDate.working || null,
      step.plannedDate.endTime || null,
      step.plannedDate.type,
      null,
      CurrentIST()
    );

    // ✅ who comes directly from step.who array — fallback to triggeredBy
    const stepDoers = doers?.length > 0 ? doers : [triggeredBy];

    await FmsTasks.create({
      fmsTaskId,
      fmsQAId,
      fmsMasterId: fmsMaster.fmsMasterId,
      fmsName: fmsMaster.fmsName,
      requestForm: fmsMaster.requestForm,
      department: fmsMaster.department,
      fmsTaskDoers: stepDoers,          // ✅ Direct array [{ empId, empName }]
      triggeredBy,                       // ✅ Who submitted the form
      fmsTaskStatus: "PENDING",
      plannedDate: step.plannedDate,
      what: step.what,
      how: step.how || { type: "NONE", description: "", formStepsQustions: [], miniStepsDetails: [] },
      stepId: step.step,                 // ✅ step.step (number) not step.id
      stepType: step.stepType || null,
      startTimeType: step.startTimeType,
      fmsTaskCreatedTime: currentDate,
      fmsTaskStartTime: currentDate,
      fmsTaskPlannedCompletionTime: plannedTime
    });

    console.log(`✅ Task created for step ${step.step}`);

  } catch (error) {
    console.error(`Error creating task for step ${step.step}:`, error);
    throw error;
  }
}


// ─── Handle T-X Steps ─────────────────────────────────────────────────────────
async function createTxSteps(fmsMaster, steps, fmsQAId, fmsQA, triggeredBy) {
  for (let step of steps) {
    try {
      const lastDoc = await FmsTasks.findOne().sort({ fmsTaskId: -1 });
      const fmsTaskId = lastDoc ? lastDoc.fmsTaskId + 1 : 1;

      const currentDate = moment().tz('Asia/Kolkata').format();

      // ✅ T-X uses the start date answer from fmsQA (isStartDate: true field)
      const startDateAnswer = fmsQA.find(q => q.isStartDate === true)?.answer || fmsQA[0]?.answer;

      const plannedTime = await calculateFmsPlannedCompletionTime(
        step.plannedDate.duration,
        step.plannedDate.durationType,
        step.plannedDate.working || null,
        step.plannedDate.endTime || null,
        step.plannedDate.type,
        startDateAnswer,
        CurrentIST()
      );

      // ✅ who is direct array on step
      const stepDoers = step.who?.length > 0 ? step.who : [triggeredBy];

      await FmsTasks.create({
        fmsTaskId,
        fmsQAId,
        fmsMasterId: fmsMaster.fmsMasterId,
        fmsName: fmsMaster.fmsName,
        requestForm: fmsMaster.requestForm,
        department: fmsMaster.department,
        fmsTaskDoers: stepDoers,
        triggeredBy,
        fmsTaskStatus: "PENDING",
        plannedDate: step.plannedDate,
        what: step.what,
        how: step.how || { type: "NONE", description: "", formStepsQustions: [], miniStepsDetails: [] },
        stepId: step.step,
        stepType: step.stepType || null,
        startTimeType: step.startTimeType,
        fmsTaskCreatedTime: currentDate,
        fmsTaskStartTime: currentDate,
        fmsTaskPlannedCompletionTime: plannedTime
      });

      console.log(`✅ T-X Task created for step ${step.step}`);

    } catch (error) {
      console.error(`Error creating T-X task for step ${step.step}:`, error);
    }
  }
}

module.exports = submitQuestionare;