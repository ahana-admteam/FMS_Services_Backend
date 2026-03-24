/**
 * HR ONBOARDING FLOW CONFIG
 *
 * A complex multi-step, multi-module flow covering the full
 * employee onboarding lifecycle.
 *
 * Steps (in order):
 *   1. document_collection  — HR collects employee documents        (manual)
 *   2. document_verification — compliance verifies docs             (approval)
 *   3. manager_approval      — hiring manager approves onboarding   (approval)
 *   4. account_provisioning  — IT provisions accounts automatically (auto)
 *   5. welcome_notification  — system sends welcome email           (notify)
 *
 * Each step is owned by a module inside /modules/.
 */

const HR_ONBOARDING_CONFIG = {
  flowKey:     'hr-onboarding',
  name:        'HR Employee Onboarding',
  description: 'Full lifecycle onboarding flow: document collection, verification, manager approval, account provisioning, and welcome notification.',
  version:     1,
  isActive:    true,
  steps: [
    {
      stepKey:     'document_collection',
      label:       'Document Collection',
      type:        'manual',
      order:       1,
      description: 'HR team collects all required onboarding documents from the new employee.',
      meta: {
        requiredDocs: ['national_id', 'offer_letter_signed', 'bank_details', 'emergency_contact'],
      },
    },
    {
      stepKey:     'document_verification',
      label:       'Document Verification',
      type:        'approval',
      order:       2,
      description: 'Compliance officer verifies all submitted documents are valid.',
    },
    {
      stepKey:     'manager_approval',
      label:       'Manager Approval',
      type:        'approval',
      order:       3,
      description: 'Hiring manager gives final approval to proceed with onboarding.',
    },
    {
      stepKey:     'account_provisioning',
      label:       'Account Provisioning',
      type:        'auto',
      order:       4,
      description: 'IT systems automatically provision email, Slack, and internal tool access.',
    },
    {
      stepKey:     'welcome_notification',
      label:       'Welcome Notification',
      type:        'notify',
      order:       5,
      description: 'System sends a welcome email with credentials and onboarding guide.',
    },
  ],
};

module.exports = { HR_ONBOARDING_CONFIG };
