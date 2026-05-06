const express = require("express");
const updateFmsTasks = express.Router();
const moment = require("moment");
const { CurrentIST } = require("../../../helpers/convertGMTtoIST");
const { calculateFmsPlannedCompletionTime } = require("../../../helpers/calculateFmsPlannedCompleationTime");
const { fetchUserDetails } = require("../../../helpers/fetchuserDetails");
const emailService = require("../../../helpers/emailService");

// MODELS
const FmsQA = require("../../models/fmsQA.model");
const FmsMaster = require("../../models/fmsMaster.model");
const FmsTasks = require("../../models/fmsTasks.model");


// ─── Update Task & Create Next Step ──────────────────────────────────────────
updateFmsTasks.post('/updateFmsTask', async (req, res) => {
  try {
    const token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({ message: "Authorization header missing" });
    }

    const userDetails = await fetchUserDetails(token);
    const { emp_id, email_id } = userDetails.result;

    const { fmsMasterId, fmsQAId, fmsTaskId, fmsWhat, formStepsAnswers, fmsTaskQualityDetails ,selectedStatus,requestorFeedback,completedBy   } = req.body;

    console.log("req.body",req.body);
    

    // ✅ Validate required fields
    if (!fmsMasterId || !fmsQAId || !fmsTaskId || !fmsWhat) {
      return res.status(400).json({ message: "fmsMasterId, fmsQAId, fmsTaskId and fmsWhat are required" });
    }

    // ✅ Fetch fmsMaster
    const fmsMasterDocument = await FmsMaster.findOne({ fmsMasterId });
    if (!fmsMasterDocument) {
      return res.status(404).json({ message: "fmsMaster not found" });
    }

    // ✅ Fetch fmsQA document
    const fmsQAdocument = await FmsQA.findOne({ fmsMasterId, fmsQAId });
    if (!fmsQAdocument) {
      return res.status(404).json({ message: "fmsQA document not found" });
    }

    // ✅ Update current task to COMPLETED
    // await updateTaskStatus(fmsTaskId, formStepsAnswers, fmsTaskQualityDetails,selectedStatus ,requestorFeedback  );
    console.log("Task updated to COMPLETED");

    // ✅ Find current step by matching what.what
    const currentStep = fmsMasterDocument.fmsSteps.find(
      step => step.what.what === fmsWhat.what
    );

    if (!currentStep) {
      return res.status(404).json({ message: "Current step not found in fmsMaster" });
    }

    //  from MASTER collection


let formattedFeedback = null;
console.log("currentStep",currentStep);

if (
  currentStep?.requestorFeedback?.length > 0 &&
  Array.isArray(requestorFeedback) &&
  requestorFeedback.length > 0
){
  const masterFeedback = currentStep.requestorFeedback;

  formattedFeedback = masterFeedback.map(q => {
    const answerObj = requestorFeedback.find(
  a => a?.id != null && q?.id != null && String(a.id) === String(q.id)
);

    return {
      ...q,
      answer: answerObj ? answerObj.answer : null
    };
  });
}
    console.log("Current step:", currentStep.step);
    await updateTaskStatus(
  fmsTaskId,
  formStepsAnswers,
  fmsTaskQualityDetails,
  selectedStatus,
  formattedFeedback,
  completedBy
);

console.log("selectedStatus",selectedStatus);

// ─── Email Trigger Block 
try {
  const stepNum = currentStep.step;

  // Pull requestor info from fmsQAdocument
  console.log("fmsQAdocument",fmsQAdocument);
  
  // Adjust field names to match your actual fmsQA schema
 // Requestor email — match by question text containing "mail" or "email"
const requestorEmail =
  fmsQAdocument.fmsQACreatedBy?.email ||
  fmsQAdocument.fmsQA?.find(q =>
    q.question?.toLowerCase().includes("mail") ||
    q.question?.toLowerCase().includes("email")
  )?.answer ||
  null;

// Requestor name
const requestorName =
  fmsQAdocument.fmsQA?.find(q =>
    q.question?.toLowerCase().includes("name")
  )?.answer || "Team";

// Book name — match by question text containing "book"
const bookName =
  fmsQAdocument.fmsQA?.find(q =>
    q.question?.toLowerCase().includes("book")
  )?.answer || "Requested Book";const responsiblePerson = completedBy?.empName || email_id;
  const notIssuedReason   = formStepsAnswers?.reason || null;

  console.log("EMAIL BLOCK HIT");
  console.log("stepNum:", stepNum);
  console.log("selectedStatus:", selectedStatus);
  console.log("requestorEmail:", requestorEmail);
  console.log("bookName:", bookName);
  console.log("responsiblePerson:", responsiblePerson);

 if (stepNum === 2) {
  if (selectedStatus.statusName === "Available") {
    await emailService.sendBookAvailable({ requestorEmail, responsiblePerson });
    console.log(" Step 2 - Available email sent");

  } else if (selectedStatus.statusName === "Not Available") {
    await emailService.sendBookNotAvailable({ requestorEmail, reason: notIssuedReason, responsiblePerson });
    console.log(" Step 2 - Not Available email sent");
  }
}

if (stepNum === 3) {
  if (selectedStatus.statusName === "Issued") {
    await emailService.sendBookIssued({ requestorEmail, bookName });
    console.log(" Step 3 - Issued email sent");

  } else if (selectedStatus.statusName === "Not Issued") {
    await emailService.sendBookNotIssued({ requestorEmail, reason: notIssuedReason, responsiblePerson });
    console.log(" Step 3 - Not Issued email sent");
  }
}

if (stepNum === 4) {
  // Admin updates after receiving acknowledgement mail from requestor
  await emailService.sendAcknowledgementConfirmed({ requestorEmail, bookName, responsiblePerson });
  console.log(" Step 4 - Acknowledgement confirmed email sent");
}

if (stepNum === 5) {
  // Admin sends due date reminder
  await emailService.sendDueDateReminderManual({ requestorEmail, dueDate: fmsQAdocument?.dueDate || null });
  console.log(" Step 5 - Due date reminder email sent");
}

if (stepNum === 6) {
  // Admin collects book back
  await emailService.sendBookCollected({ requestorEmail, bookName, responsiblePerson });
  console.log(" Step 6 - Book collected email sent");
}

if (stepNum === 7) {
  // Admin sends feedback link
  const step6Task = await FmsTasks.findOne({ fmsMasterId, fmsQAId, stepId: 6 });
  const actualReturnDate = step6Task?.fmsTaskCompletedTime || new Date();
  await emailService.sendFeedbackRequest({ requestorEmail, bookName, responsiblePerson, actualReturnDate });
  console.log("Step 7 - Feedback request email sent");
}

// Steps 8 & 9 — no email triggers

} catch (emailErr) {
  //  Email failure should NOT block the API response
  console.error(" Email trigger failed (non-blocking):", emailErr.message);
}
//  End Email Block

// STOP FLOW IF NEGATIVE RESPONSE

const negativeStatuses = ["NOT AVAILABLE", "NOT ISSUED", "REJECTED"];

const statusName = selectedStatus?.statusName?.toUpperCase();

const isNegative = negativeStatuses.includes(statusName);

  if (isNegative) {
  console.log("Negative response detected — stopping flow");

  // Option 1: Close entire flow
  await FmsQA.findOneAndUpdate(
    { fmsQAId },
    { $set: { fmsQAisLive: false } }
  );

  return res.json({
    message: "Task Updated — Flow stopped due to negative response",
    status: 200
  });
}



    //  Find next step by step number (sequential — no next[] field in your schema)
    const nextStep = fmsMasterDocument.fmsSteps.find(
      step => step.step === currentStep.step + 1
    );

    if (!nextStep) {
      //  This was the last step — mark fmsQA as complete
      console.log("This is the last step — closing fmsQA flow");
      await FmsQA.findOneAndUpdate(
        { fmsQAId },
        { $set: { fmsQAisLive: false } }
      );
      return res.json({ message: "Task Updated — FMS flow completed", status: 200 });
    }

    console.log("Next step to create:", nextStep.step);

    //  Check if next task already exists
    const existingTask = await FmsTasks.findOne({ fmsMasterId, fmsQAId, stepId: nextStep.step });

    if (existingTask) {
      //  Task already exists — just update its status based on planned time
      const currentDate = moment().tz('Asia/Kolkata').format();
      const updatedStatus = existingTask.fmsTaskPlannedCompletionTime > currentDate
        ? "PENDING"
        : "OVERDUE";

      await FmsTasks.findOneAndUpdate(
        { fmsMasterId, fmsQAId, stepId: nextStep.step },
        { $set: { fmsTaskStatus: updatedStatus } }
      );

      console.log(`Next task already existed — updated status to ${updatedStatus}`);

    } else {
      //  Task does not exist — create it
      if (nextStep.plannedDate.type === "T-X") {
        // Create all remaining T-X steps
        const txSteps = fmsMasterDocument.fmsSteps.filter(
          s => s.plannedDate.type === "T-X" && s.step >= nextStep.step
        );
        await createTxSteps(fmsMasterDocument, txSteps, fmsQAId, fmsQAdocument.fmsQA);
      } else {
        // Create next A2P step
        const doers = nextStep.who?.length > 0
          ? nextStep.who
          : [{ empId: emp_id, email: email_id }];
        await createNextTask(fmsMasterDocument, nextStep, fmsQAId, doers);
      }
    }

    // return res.json({ message: "Task Updated", status: 200 });
  const nextTask = await FmsTasks.findOne({
  fmsMasterId,
  fmsQAId,
  stepId: nextStep.step
});

return res.json({
  message: "Task Updated",
  status: 200,
  fmsTaskId: nextTask?.fmsTaskId
});

  } catch (error) {
    console.error("Error in updateFmsTask:", error);
    return res.status(500).json({ error: error.message });
  }
});


// ─── Update Task to COMPLETED ─────────────────────────────────────────────────
async function updateTaskStatus(fmsTaskId, formStepsAnswers, fmsTaskQualityDetails,selectedStatus,formattedFeedback, completedBy   ) {
  try {
    const currentDate = moment().tz('Asia/Kolkata').format();

    const task = await FmsTasks.findOneAndUpdate(
      { fmsTaskId },
      {
//         $set: {
//           fmsTaskStatus: "COMPLETED",
//           formStepsAnswers: formStepsAnswers || null,
//           fmsTaskQualityDetails: fmsTaskQualityDetails || null,
//           fmsTaskCompletedTime: currentDate,
//           fmsTaskStepStatus: selectedStatus || null,
//           // requestorFeedback : formattedFeedback    || null
//           ...(Array.isArray(formattedFeedback) && formattedFeedback.length > 0 && {
//           requestorFeedback: formattedFeedback,
//           completedBy:completedBy
// }),

//           //completed by
//           ...(completedBy && {
//             completedBy: {
//               empId: completedBy.empId,
//               empName: completedBy.empName
//             }
//           })

//         }
$set: {
  fmsTaskStatus: "COMPLETED",
  formStepsAnswers: formStepsAnswers || null,
  fmsTaskQualityDetails: fmsTaskQualityDetails || null,
  fmsTaskCompletedTime: currentDate,
  fmsTaskStepStatus: selectedStatus || null,

  //  feedback (only if exists)
  ...(Array.isArray(formattedFeedback) && formattedFeedback.length > 0 && {
    requestorFeedback: formattedFeedback
  }),

  //  ALWAYS store completedBy
  completedBy: {
    empId: completedBy?.empId || null,
    empName: completedBy?.empName || null
  }
}
        
      },
      { new: true }
    );

    if (!task) {
      console.log(`Task with fmsTaskId ${fmsTaskId} not found`);
      return;
    }

    // ✅ Set ONTIME or DELAY based on planned completion time
    const isOnTime = currentDate <= task.fmsTaskPlannedCompletionTime;
    await FmsTasks.findOneAndUpdate(
      { fmsTaskId },
      { $set: { fmsTaskCompletedStatus: isOnTime ? "ONTIME" : "DELAY" } }
    );

    console.log(`Task ${fmsTaskId} completed — ${isOnTime ? "ONTIME" : "DELAY"}`);

    // ✅ If this task was transferred from another task, update that too
    if (task.isTransferredFrom && task.transferredFromTaskId) {
      console.log("Updating transferred-from task:", task.transferredFromTaskId);
      await updateTaskStatus(task.transferredFromTaskId, formStepsAnswers, fmsTaskQualityDetails,selectedStatus,formattedFeedback ,completedBy  );
    }

  } catch (error) {
    console.error("Error in updateTaskStatus:", error);
    throw error;
  }
}


// ─── Create Next A2P Task ─────────────────────────────────────────────────────
async function createNextTask(fmsMasterDocument, step, fmsQAId, doers) {
  try {
    const lastDoc = await FmsTasks.findOne().sort({ fmsTaskId: -1 });
    const fmsTaskId = lastDoc ? lastDoc.fmsTaskId + 1 : 1;

    const currentDate = moment().tz('Asia/Kolkata').format();

    const plannedTime = await calculateFmsPlannedCompletionTime(
      step.plannedDate.duration,
      step.plannedDate.durationType,
      step.plannedDate.working || null,
      step.plannedDate.endTime || null,
      step.plannedDate.type,
      null,
      CurrentIST()
    );

    await FmsTasks.create({
      fmsTaskId,
      fmsQAId,
      fmsMasterId: fmsMasterDocument.fmsMasterId,
      fmsName: fmsMasterDocument.fmsName,
      requestForm: fmsMasterDocument.requestForm,
      department: fmsMasterDocument.department,
      fmsTaskDoers: doers,             
      fmsTaskStatus: "PENDING",
      fmsTaskCompletedStatus: null,
      plannedDate: step.plannedDate,
      what: step.what,
      how: step.how || { type: "NONE", description: "", formStepsQustions: [], miniStepsDetails: [] },
      stepId: step.step,                  // ✅ step.step not step.id
      stepType: step.stepType || null,
      startTimeType: step.startTimeType,
      fmsTaskCreatedTime: currentDate,
      fmsTaskStartTime: currentDate,
      fmsTaskPlannedCompletionTime: plannedTime,
      formStepsAnswers: null,
      fmsTaskQualityDetails: null,
      isTransferredFrom: false,
      isTranferredTo: false,
      transferredFromTaskId: null,
      transferredToTaskId: null
    });

    console.log(`✅ Next task created for step ${step.step}`);

  } catch (error) {
    console.error(`Error creating next task for step ${step.step}:`, error);
    throw error;
  }
}


// ─── Create T-X Steps ─────────────────────────────────────────────────────────
async function createTxSteps(fmsMasterDocument, txSteps, fmsQAId, fmsQA) {
  for (let step of txSteps) {
    try {
      const lastDoc = await FmsTasks.findOne().sort({ fmsTaskId: -1 });
      const fmsTaskId = lastDoc ? lastDoc.fmsTaskId + 1 : 1;

      const currentDate = moment().tz('Asia/Kolkata').format();

      // ✅ Find the isStartDate answer from fmsQA for T-X calculation
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
      const stepDoers = step.who?.length > 0 ? step.who : [];

      await FmsTasks.create({
        fmsTaskId,
        fmsQAId,
        fmsMasterId: fmsMasterDocument.fmsMasterId,
        fmsName: fmsMasterDocument.fmsName,
        requestForm: fmsMasterDocument.requestForm,
        department: fmsMasterDocument.department,
        fmsTaskDoers: stepDoers,
        fmsTaskStatus: "PENDING",
        fmsTaskCompletedStatus: null,
        plannedDate: step.plannedDate,
        what: step.what,
        how: step.how || { type: "NONE", description: "", formStepsQustions: [], miniStepsDetails: [] },
        stepId: step.step,
        stepType: step.stepType || null,
        startTimeType: step.startTimeType,
        fmsTaskCreatedTime: currentDate,
        fmsTaskStartTime: currentDate,
        fmsTaskPlannedCompletionTime: plannedTime,
        formStepsAnswers: null,
        fmsTaskQualityDetails: null,
        isTransferredFrom: false,
        isTranferredTo: false,
        transferredFromTaskId: null,
        transferredToTaskId: null
      });

      console.log(`✅ T-X task created for step ${step.step}`);

    } catch (error) {
      console.error(`Error creating T-X task for step ${step.step}:`, error);
    }
  }
}

module.exports = updateFmsTasks;