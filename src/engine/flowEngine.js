const Flow         = require('../models/flow.model');
const FlowInstance = require('../models/instance.model');
const FlowHistory  = require('../models/history.model');
const { createError } = require('../common/middleware/errorHandler');

/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║                      FLOW ENGINE                            ║
 * ╠══════════════════════════════════════════════════════════════╣
 * ║  The engine owns ALL state transitions for every instance.  ║
 * ║  Flow-specific services call engine methods — they never    ║
 * ║  mutate Instance or History documents directly.             ║
 * ╚══════════════════════════════════════════════════════════════╝
 *
 * Public API:
 *   startInstance(flowKey, triggeredBy, initialData)  → instance
 *   advanceStep(instanceId, stepKey, actor, output)   → instance
 *   failStep(instanceId, stepKey, actor, reason)      → instance
 *   cancelInstance(instanceId, actor)                 → instance
 *   getInstance(instanceId)                           → instance
 *   getHistory(instanceId)                            → history[]
 */

// ─── helpers ──────────────────────────────────────────────────

async function _appendHistory(instanceId, flowKey, stepKey, fromStatus, toStatus, actor, payload = {}) {
  await FlowHistory.create({ instanceId, flowKey, stepKey, fromStatus, toStatus, actor, payload });
}

function _buildInitialSteps(flowSteps) {
  return flowSteps
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((s) => ({
      stepKey:     s.stepKey,
      status:      'pending',
      startedAt:   null,
      completedAt: null,
      output:      {},
      error:       null,
    }));
}

// ─── public methods ────────────────────────────────────────────

/**
 * Create and start a new instance of a flow.
 * Sets the first step to 'active'.
 */
async function startInstance(flowKey, triggeredBy, initialData = {}) {
  const flow = await Flow.findOne({ flowKey, isActive: true });
  if (!flow) throw createError(404, `Flow "${flowKey}" not found or inactive.`);
  if (!flow.steps.length) throw createError(400, `Flow "${flowKey}" has no steps defined.`);

  const sortedSteps = [...flow.steps].sort((a, b) => a.order - b.order);
  const firstStep   = sortedSteps[0];

  const stepStates = _buildInitialSteps(flow.steps);

  // Mark the first step active immediately
  const firstIdx = stepStates.findIndex((s) => s.stepKey === firstStep.stepKey);
  stepStates[firstIdx].status    = 'active';
  stepStates[firstIdx].startedAt = new Date();

  const instance = await FlowInstance.create({
    flowKey,
    flowId:      flow._id,
    triggeredBy,
    status:      'in_progress',
    currentStep: firstStep.stepKey,
    steps:       stepStates,
    data:        initialData,
    startedAt:   new Date(),
  });

  await _appendHistory(instance._id, flowKey, firstStep.stepKey, null, 'active', triggeredBy, initialData);

  return instance;
}

/**
 * Mark the current step as completed and advance to the next one.
 * If no next step exists, mark the instance as completed.
 *
 * @param {string} instanceId
 * @param {string} stepKey     - the step being completed (must match currentStep)
 * @param {string} actor       - who is completing it
 * @param {object} output      - data produced by this step (merged into instance.data)
 */
async function advanceStep(instanceId, stepKey, actor, output = {}) {
  const instance = await FlowInstance.findById(instanceId);
  if (!instance) throw createError(404, 'Flow instance not found.');
  if (instance.status !== 'in_progress') {
    throw createError(400, `Instance is "${instance.status}" — cannot advance.`);
  }
  if (instance.currentStep !== stepKey) {
    throw createError(400, `Step "${stepKey}" is not the current active step ("${instance.currentStep}").`);
  }

  const flow        = await Flow.findOne({ flowKey: instance.flowKey });
  const sortedDefs  = [...flow.steps].sort((a, b) => a.order - b.order);
  const currentIdx  = sortedDefs.findIndex((s) => s.stepKey === stepKey);
  const nextDef     = sortedDefs[currentIdx + 1] || null;

  // Complete current step
  const stepIdx = instance.steps.findIndex((s) => s.stepKey === stepKey);
  instance.steps[stepIdx].status      = 'completed';
  instance.steps[stepIdx].completedAt = new Date();
  instance.steps[stepIdx].output      = output;

  // Merge step output into shared instance data
  instance.data = { ...instance.data, ...output };

  await _appendHistory(instance._id, instance.flowKey, stepKey, 'active', 'completed', actor, output);

  if (nextDef) {
    // Activate next step
    const nextIdx = instance.steps.findIndex((s) => s.stepKey === nextDef.stepKey);
    instance.steps[nextIdx].status    = 'active';
    instance.steps[nextIdx].startedAt = new Date();
    instance.currentStep              = nextDef.stepKey;

    await _appendHistory(instance._id, instance.flowKey, nextDef.stepKey, 'pending', 'active', 'system');
  } else {
    // No more steps — instance is complete
    instance.status      = 'completed';
    instance.currentStep = null;
    instance.completedAt = new Date();

    await _appendHistory(instance._id, instance.flowKey, stepKey, 'completed', 'completed', 'system', { note: 'Flow completed' });
  }

  instance.markModified('steps');
  instance.markModified('data');
  await instance.save();

  return instance;
}

/**
 * Mark the current step as failed, and mark the whole instance as failed.
 */
async function failStep(instanceId, stepKey, actor, reason = 'Unknown error') {
  const instance = await FlowInstance.findById(instanceId);
  if (!instance) throw createError(404, 'Flow instance not found.');
  if (instance.currentStep !== stepKey) {
    throw createError(400, `Step "${stepKey}" is not the active step.`);
  }

  const stepIdx = instance.steps.findIndex((s) => s.stepKey === stepKey);
  instance.steps[stepIdx].status      = 'failed';
  instance.steps[stepIdx].completedAt = new Date();
  instance.steps[stepIdx].error       = reason;

  instance.status      = 'failed';
  instance.currentStep = null;
  instance.completedAt = new Date();

  instance.markModified('steps');
  await instance.save();

  await _appendHistory(instance._id, instance.flowKey, stepKey, 'active', 'failed', actor, { reason });

  return instance;
}

/**
 * Cancel an in-progress instance.
 */
async function cancelInstance(instanceId, actor) {
  const instance = await FlowInstance.findById(instanceId);
  if (!instance) throw createError(404, 'Flow instance not found.');
  if (['completed', 'failed', 'cancelled'].includes(instance.status)) {
    throw createError(400, `Instance already in terminal state: "${instance.status}".`);
  }

  // Mark active step as skipped if any
  if (instance.currentStep) {
    const stepIdx = instance.steps.findIndex((s) => s.stepKey === instance.currentStep);
    if (stepIdx >= 0) {
      instance.steps[stepIdx].status = 'skipped';
      instance.markModified('steps');
    }
  }

  instance.status      = 'cancelled';
  instance.currentStep = null;
  instance.completedAt = new Date();
  await instance.save();

  await _appendHistory(instance._id, instance.flowKey, instance.currentStep || 'n/a', 'active', 'cancelled', actor);

  return instance;
}

/**
 * Fetch a single instance by ID (with lean for read-only use).
 */
async function getInstance(instanceId) {
  const instance = await FlowInstance.findById(instanceId).lean();
  if (!instance) throw createError(404, 'Flow instance not found.');
  return instance;
}

/**
 * Fetch the full history log for an instance.
 */
async function getHistory(instanceId) {
  return FlowHistory.find({ instanceId }).sort({ happenedAt: 1 }).lean();
}

module.exports = { startInstance, advanceStep, failStep, cancelInstance, getInstance, getHistory };
