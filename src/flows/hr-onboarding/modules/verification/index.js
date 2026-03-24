/**
 * VERIFICATION MODULE
 * Thin wrapper — document_verification is an approval step
 * handled by the approval module with stepKey = 'document_verification'.
 *
 * Having a dedicated module file here keeps the folder structure clean
 * and allows verification-specific logic (e.g. external KYC API calls)
 * to be added later without touching the approval module.
 */

const { processApproval } = require('../approval/index');

async function verifyDocuments(instanceId, decision, actor, note = '') {
  return processApproval(instanceId, 'document_verification', decision, actor, note);
}

module.exports = { verifyDocuments };
