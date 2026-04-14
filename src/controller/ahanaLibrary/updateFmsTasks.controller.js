const moment = require("moment-timezone");

// HELPERS
const { calculateFmsPlannedCompletionTime } = require("../../../helpers/calculateFmsPlannedCompleationTime");
const { CurrentIST } = require("../../../helpers/convertGMTtoIST");
const { infoLogger } = require("../../../middleware/logger");

// MODELS
const FmsTasks = require("../../models/fmsTasks.model");
const FmsMaster = require("../../models/fmsMaster.model");
const FmsQA = require("../../models/fmsQA.model");

// Helpers to cope with collection shape differences (string vs number ids)
const buildIdQuery = (field, value) => {
  if (value === undefined || value === null) return { [field]: value };
  const asNumber = Number(value);
  if (!Number.isNaN(asNumber)) {
    return { $or: [{ [field]: value }, { [field]: asNumber }] };
  }
  return { [field]: value };
};

// ================= COMPLETE TASK =================
const completeTask = async (fmsTaskId, formStepsAnswers, fmsTaskQualityDetails) => {
  const update = {
    fmsTaskStatus: "Completed",
    completedOn: CurrentIST(),
    formStepsAnswers,
    fmsTaskQualityDetails
  };

  await FmsTasks.updateOne(buildIdQuery("fmsTaskId", fmsTaskId), { $set: update });
};

// ================= CLOSE FLOW =================
const closeFmsFlow = async (fmsQAId, fmsMasterId) => {
  await FmsQA.updateOne(buildIdQuery("fmsQAId", fmsQAId), {
    $set: {
      fmsTaskStatus: "Completed",
      completedOn: CurrentIST()
    }
  });
};

// ================= HANDLE NORMAL STEP =================
const handleNormalStep = async (fmsMaster, nextStep, fmsQAId) => {
  const plannedDate = calculateFmsPlannedCompletionTime(
    nextStep.plannedDate,
    CurrentIST()
  );

  const newTask = {
    fmsTaskId: `FT-${Date.now()}`,
    fmsQAId,
    stepId: nextStep.id,
    stepName: nextStep.name,
    fmsTaskStatus: "Pending",
    plannedCompletionDate: plannedDate,
    createdOn: CurrentIST()
  };

  await FmsTasks.create(newTask);
};

// ================= HANDLE P2P STEPS =================
const handleP2PSteps = async (fmsMaster, steps, nextStepId, fmsQAId) => {
  const p2pSteps = steps.filter(
    step => step.p2p && step.previousStepId === nextStepId
  );

  for (const step of p2pSteps) {
    const plannedDate = calculateFmsPlannedCompletionTime(
      step.plannedDate,
      CurrentIST()
    );

    const newTask = {
      fmsTaskId: `FT-${Date.now()}-${step.id}`,
      fmsQAId,
      stepId: step.id,
      stepName: step.name,
      fmsTaskStatus: "Pending",
      plannedCompletionDate: plannedDate,
      createdOn: CurrentIST()
    };

    await FmsTasks.create(newTask);
  }
};

// ================= CREATE TX STEPS =================
const createTxSteps = async (fmsMaster, txSteps, fmsQAId, fmsQA) => {
  for (const step of txSteps) {
    const plannedDate = calculateFmsPlannedCompletionTime(
      step.plannedDate,
      CurrentIST()
    );

    const newTask = {
      fmsTaskId: `FT-${Date.now()}-${step.id}`,
      fmsQAId,
      stepId: step.id,
      stepName: step.name,
      fmsTaskStatus: "Pending",
      plannedCompletionDate: plannedDate,
      createdOn: CurrentIST()
    };

    await FmsTasks.create(newTask);
  }
};

// ================= UPDATE FMS TASK =================
exports.updateFmsTask = async (req, res) => {
  try {
    const {
      fmsTaskId,
      fmsMasterId,
      fmsQAId,
      formStepsAnswers,
      fmsTaskQualityDetails
    } = req.body;

    infoLogger.log(
      "info",
      `API:updateFmsTask | Task:${fmsTaskId} | QA:${fmsQAId}`
    );

    // COMPLETE CURRENT TASK
    await completeTask(
      fmsTaskId,
      formStepsAnswers,
      fmsTaskQualityDetails
    );

    const fmsMaster = await FmsMaster.findOne(buildIdQuery("fmsMasterId", fmsMasterId));
    const fmsQA = await FmsQA.findOne(buildIdQuery("fmsQAId", fmsQAId));

    if (!fmsMaster) {
      return res.status(404).json({ message: "fmsMaster not found" });
    }


    const currentTask = await FmsTasks.findOne(buildIdQuery("fmsTaskId", fmsTaskId));

    // find current step — tolerate `id` or `step` keys in master and `stepId` or `stepId` in task
    const currentStep = fmsMaster.fmsSteps.find(step => {
      const stepIdFromMaster = step.id ?? step.step ?? step.stepId;
      const taskStepId = currentTask?.stepId ?? currentTask?.step;
      return String(stepIdFromMaster) === String(taskStepId);
    });

    if (!currentStep) {
      return res.status(404).json({ message: "current step not found in fmsMaster" });
    }

    // LAST STEP
    if (currentStep.endStep) {
      await closeFmsFlow(fmsQAId, fmsMasterId);

      return res.json({
        message: "Last step completed",
        status: 200
      });
    }


    // resolve next step id robustly — `currentStep.next` may be absent or different shaped
    let nextId;
    if (Array.isArray(currentStep.next) && currentStep.next.length) {
      nextId = currentStep.next[0].id ?? currentStep.next[0].step ?? currentStep.next[0];
    } else if (Array.isArray(currentTask?.next) && currentTask.next.length) {
      nextId = currentTask.next[0].id ?? currentTask.next[0].step ?? currentTask.next[0];
    }

    if (!nextId) {
      return res.status(400).json({ message: "next step id not found" });
    }

    const nextStep = fmsMaster.fmsSteps.find(s => (s.id ?? s.step ?? s.stepId) == nextId);

    if (!nextStep) {
      return res.status(404).json({ message: "next step not found in fmsMaster" });
    }

    // T-X FLOW
    const nextPlannedType = String(nextStep?.plannedDate?.type || "");
    const isTx = nextPlannedType === "T-X" || nextPlannedType.includes("T-X");

    if (isTx) {
      const txSteps = fmsMaster.fmsSteps.filter(s => {
        const t = String(s?.plannedDate?.type || "");
        return t === "T-X" || t.includes("T-X");
      });

      await createTxSteps(fmsMaster, txSteps, fmsQAId, fmsQA);
    }
    // NORMAL FLOW
    else {
      await handleNormalStep(fmsMaster, nextStep, fmsQAId);

      // use normalized nextStep id when handling p2p steps
      const nextStepId = nextStep.id ?? nextStep.step ?? nextStep.stepId;
      await handleP2PSteps(fmsMaster, fmsMaster.fmsSteps, nextStepId, fmsQAId);
    }

    return res.json({
      message: "Task updated and next step triggered",
      status: 200
    });

  } catch (error) {
    console.error("Error in updateFmsTask:", error);

    return res.status(500).json({
      error: error.message
    });
  }
};
