const INSTANCE_STATUS = {
  PENDING:     'pending',     // created, not yet started
  IN_PROGRESS: 'in_progress', // at least one step done
  COMPLETED:   'completed',   // all steps done
  FAILED:      'failed',      // a step errored out
  CANCELLED:   'cancelled',   // manually stopped
};

const STEP_STATUS = {
  PENDING:   'pending',
  ACTIVE:    'active',
  COMPLETED: 'completed',
  SKIPPED:   'skipped',
  FAILED:    'failed',
};

const STEP_TYPE = {
  MANUAL:    'manual',    // human action required
  AUTO:      'auto',      // auto-executed by engine
  APPROVAL:  'approval',  // needs an approver
  NOTIFY:    'notify',    // fire-and-forget notification
};

module.exports = { INSTANCE_STATUS, STEP_STATUS, STEP_TYPE };
