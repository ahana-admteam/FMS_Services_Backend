const mongoose = require('mongoose');

/**
 * EMPLOYEE MODEL — local to hr-onboarding flow
 * Stores employee profile and onboarding metadata.
 */

const EmployeeSchema = new mongoose.Schema(
  {
    employeeId:   { type: String, required: true, unique: true },
    name:         { type: String, required: true },
    email:        { type: String, required: true },
    department:   { type: String, required: true },
    role:         { type: String, required: true },
    managerId:    { type: String, required: true },
    joiningDate:  { type: Date, required: true },
    // Onboarding state
    instanceId:   { type: mongoose.Schema.Types.ObjectId, ref: 'FlowInstance', default: null },
    onboardingStatus: {
      type: String,
      enum: ['not_started', 'in_progress', 'completed', 'failed'],
      default: 'not_started',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Employee', EmployeeSchema);
