const service         = require('../services/hr.service');
const { sendSuccess } = require('../../../common/utils/response.util');

async function start(req, res, next) {
  try {
    const result = await service.startOnboarding(req.body);
    sendSuccess(res, 201, 'HR onboarding flow started.', result);
  } catch (err) { next(err); }
}

async function submitDocuments(req, res, next) {
  try {
    const { instanceId } = req.params;
    const { documents, actor } = req.body;
    const result = await service.submitDocuments(instanceId, documents, actor);
    sendSuccess(res, 200, 'Documents submitted. Flow advanced to verification.', result);
  } catch (err) { next(err); }
}

async function verifyDocuments(req, res, next) {
  try {
    const { instanceId } = req.params;
    const { decision, actor, note } = req.body;
    const result = await service.verifyDocuments(instanceId, decision, actor, note);
    const msg = decision === 'approved'
      ? 'Documents verified. Flow advanced to manager approval.'
      : 'Documents rejected. Flow failed.';
    sendSuccess(res, 200, msg, result);
  } catch (err) { next(err); }
}

async function managerApproval(req, res, next) {
  try {
    const { instanceId } = req.params;
    const { decision, actor, note } = req.body;
    const result = await service.managerApproval(instanceId, decision, actor, note);

    // If approved, auto-trigger provisioning immediately
    if (decision === 'approved' && result.instance.status === 'in_progress') {
      const provisionResult = await service.provisionAccounts(instanceId);
      return sendSuccess(res, 200, 'Manager approved. Accounts provisioned. Welcome notification sent. Onboarding complete.', provisionResult);
    }

    const msg = decision === 'approved'
      ? 'Approved. Proceeding to provisioning.'
      : 'Rejected. Flow failed.';
    sendSuccess(res, 200, msg, result);
  } catch (err) { next(err); }
}

async function detail(req, res, next) {
  try {
    const { instanceId } = req.params;
    const result = await service.getInstanceDetail(instanceId);
    sendSuccess(res, 200, 'Onboarding instance detail.', result);
  } catch (err) { next(err); }
}

async function cancel(req, res, next) {
  try {
    const { instanceId } = req.params;
    const { actor } = req.body;
    const instance = await service.cancelOnboarding(instanceId, actor || 'system');
    sendSuccess(res, 200, 'Onboarding cancelled.', { instance });
  } catch (err) { next(err); }
}

module.exports = { start, submitDocuments, verifyDocuments, managerApproval, detail, cancel };
