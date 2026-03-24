/**
 * APPROVAL MODULE
 * Handles Step 2: document_verification  (compliance officer)
 *          Step 3: manager_approval       (hiring manager)
 *
 * Both steps share the same approve/reject pattern,
 * so one module handles both via the stepKey parameter.
 *
 * On reject: calls engine.failStep() → instance moves to 'failed'.
 * On approve: calls engine.advanceStep() → moves to next step.
 */

const engine = require('../../../../engine/flowEngine');
const { createError } = require('../../../../common/middleware/errorHandler');

const APPROVAL_STEPS = ['document_verification', 'manager_approval'];

/**
 * @param {string} instanceId
 * @param {string} stepKey    - which approval step this is
 * @param {string} decision   - 'approved' | 'rejected'
 * @param {string} actor      - approver's identifier
 * @param {string} note       - optional comment
 */
async function processApproval(instanceId, stepKey, decision, actor, note = '') {
  if (!APPROVAL_STEPS.includes(stepKey)) {
    throw createError(400, `"${stepKey}" is not a valid approval step.`);
  }
  if (!['approved', 'rejected'].includes(decision)) {
    throw createError(422, 'Decision must be "approved" or "rejected".');
  }

  if (decision === 'rejected') {
    const instance = await engine.failStep(
      instanceId,
      stepKey,
      actor,
      `Rejected by ${actor}${note ? `: ${note}` : ''}`
    );
    return { instance, decision, note };
  }

  // Approved — advance
  const output = {
    [`${stepKey}_decision`]: 'approved',
    [`${stepKey}_approver`]: actor,
    [`${stepKey}_note`]:     note,
    [`${stepKey}_at`]:       new Date(),
  };

  const instance = await engine.advanceStep(instanceId, stepKey, actor, output);
  return { instance, decision, note };
}

module.exports = { processApproval };
