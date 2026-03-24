/**
 * DOCUMENT MODULE
 * Handles Step 1: document_collection
 *
 * Responsibility:
 *   - Validate that all required documents have been submitted
 *   - Store document metadata on the instance payload
 *   - Call engine.advanceStep() when done
 */

const engine = require('../../../../engine/flowEngine');
const { createError } = require('../../../../common/middleware/errorHandler');

const REQUIRED_DOCS = ['national_id', 'offer_letter_signed', 'bank_details', 'emergency_contact'];

/**
 * @param {string} instanceId
 * @param {object} documents  - map of docType → { fileName, submittedAt }
 * @param {string} actor      - HR staff member submitting
 */
async function collectDocuments(instanceId, documents, actor) {
  // Validate all required docs are present
  const missing = REQUIRED_DOCS.filter((d) => !documents[d]);
  if (missing.length) {
    throw createError(422, `Missing required documents: ${missing.join(', ')}`);
  }

  const output = {
    documents,
    documentsCollectedAt: new Date(),
    collectedBy: actor,
  };

  const instance = await engine.advanceStep(instanceId, 'document_collection', actor, output);
  return { instance, documents };
}

module.exports = { collectDocuments };
