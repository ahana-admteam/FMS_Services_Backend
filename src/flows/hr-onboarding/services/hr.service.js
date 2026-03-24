const engine       = require('../../../engine/flowEngine');
const Employee     = require('../models/employee.model');
const docModule    = require('../modules/document/index');
const verifyModule = require('../modules/verification/index');
const approvalModule = require('../modules/approval/index');
const notifyModule = require('../modules/notifications/index');
const { createError } = require('../../../common/middleware/errorHandler');

const FLOW_KEY = 'hr-onboarding';

/**
 * HR ONBOARDING SERVICE — top-level orchestrator
 *
 * Each method maps to one step in the flow.
 * All cross-cutting concerns (state, history) are handled by the engine.
 * Each method delegates domain logic to the appropriate module.
 *
 * Flow step map:
 *   startOnboarding()          → creates instance, activates step 1
 *   submitDocuments()          → step 1: document_collection  → module/document
 *   verifyDocuments()          → step 2: document_verification → module/verification
 *   managerApproval()          → step 3: manager_approval     → module/approval
 *   provisionAccounts()        → step 4: account_provisioning (auto, triggered server-side)
 *   sendWelcome()              → step 5: welcome_notification  → module/notifications
 */

/** Kick off onboarding for a new employee */
async function startOnboarding({ employeeId, name, email, department, role, managerId, joiningDate, triggeredBy }) {
  // Create employee record
  const existing = await Employee.findOne({ employeeId });
  if (existing) throw createError(409, `Employee "${employeeId}" already has an onboarding record.`);

  const employee = await Employee.create({ employeeId, name, email, department, role, managerId, joiningDate });

  // Start the flow instance with employee context as initial data
  const instance = await engine.startInstance(FLOW_KEY, triggeredBy, {
    employeeId,
    employeeName:  name,
    employeeEmail: email,
    department,
    role,
    managerId,
  });

  // Link instance back to employee record
  employee.instanceId      = instance._id;
  employee.onboardingStatus = 'in_progress';
  await employee.save();

  return { instance, employee };
}

/** Step 1: HR submits collected documents */
async function submitDocuments(instanceId, documents, actor) {
  return docModule.collectDocuments(instanceId, documents, actor);
}

/** Step 2: Compliance verifies the documents */
async function verifyDocuments(instanceId, decision, actor, note) {
  const result = await verifyModule.verifyDocuments(instanceId, decision, actor, note);
  if (result.instance.status === 'failed') {
    await _syncEmployeeStatus(instanceId, 'failed');
  }
  return result;
}

/** Step 3: Manager approves (or rejects) the onboarding */
async function managerApproval(instanceId, decision, actor, note) {
  const result = await approvalModule.processApproval(instanceId, 'manager_approval', decision, actor, note);
  if (result.instance.status === 'failed') {
    await _syncEmployeeStatus(instanceId, 'failed');
  }
  return result;
}

/**
 * Step 4: account_provisioning — AUTO step
 * Called by the server immediately after manager_approval succeeds.
 * Simulates provisioning email / Slack / JIRA accounts.
 */
async function provisionAccounts(instanceId) {
  const current = await engine.getInstance(instanceId);
  if (current.currentStep !== 'account_provisioning') {
    throw createError(400, 'Instance is not at the account_provisioning step.');
  }

  const { employeeId, employeeName, employeeEmail, department } = current.data;

  // ── Simulated provisioning ────────────────────────────────────
  const provisionedAccounts = {
    email:  `${employeeName.toLowerCase().replace(/\s/g, '.')}@company.com`,
    slack:  `@${employeeName.toLowerCase().replace(/\s/g, '_')}`,
    jira:   employeeId,
    google: `${employeeId}@company.com`,
    provisionedAt: new Date(),
    simulated: true,
  };

  console.log(`[AUTO] Provisioning accounts for ${employeeName} (${employeeId})`);

  const output = { provisionedAccounts };
  const instance = await engine.advanceStep(instanceId, 'account_provisioning', 'system', output);

  // Immediately trigger the next (notify) step since it's also automated
  const notifyResult = await notifyModule.sendWelcomeNotification(instance._id.toString());

  // Sync employee record to completed
  await _syncEmployeeStatus(instanceId, 'completed');

  return { instance: notifyResult.instance, provisionedAccounts, notification: notifyResult.notification };
}

/** Get instance detail + full history */
async function getInstanceDetail(instanceId) {
  const [instance, history] = await Promise.all([
    engine.getInstance(instanceId),
    engine.getHistory(instanceId),
  ]);
  const employee = await Employee.findOne({ instanceId }).lean();
  return { instance, history, employee };
}

/** Cancel an in-progress onboarding */
async function cancelOnboarding(instanceId, actor) {
  const instance = await engine.cancelInstance(instanceId, actor);
  await _syncEmployeeStatus(instanceId, 'failed');
  return instance;
}

// ─── private helpers ──────────────────────────────────────────

async function _syncEmployeeStatus(instanceId, status) {
  await Employee.findOneAndUpdate(
    { instanceId },
    { onboardingStatus: status },
    { new: true }
  );
}

module.exports = {
  startOnboarding,
  submitDocuments,
  verifyDocuments,
  managerApproval,
  provisionAccounts,
  getInstanceDetail,
  cancelOnboarding,
};
