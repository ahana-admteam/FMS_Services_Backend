const mongoose = require('mongoose');

/**
 * INSTANCE MODEL — one live execution of a Flow
 *
 * When a user triggers a flow, a FlowInstance is created.
 * It tracks current status, which step is active, and carries
 * a runtime data payload that each step can read/write.
 *
 * Example:
 *   Instance: user "john@x.com" running "Library Book Borrow"
 *     currentStep: "reserve"
 *     status: "in_progress"
 *     data: { bookId: "abc123", memberId: "m1" }
 */

const StepStateSchema = new mongoose.Schema(
  {
    stepKey:     { type: String, required: true },
    status:      { type: String, enum: ['pending', 'active', 'completed', 'skipped', 'failed'], default: 'pending' },
    startedAt:   { type: Date },
    completedAt: { type: Date },
    output:      { type: mongoose.Schema.Types.Mixed, default: {} }, // what this step produced
    error:       { type: String },                                    // if failed
  },
  { _id: false }
);

const InstanceSchema = new mongoose.Schema(
  {
    flowKey:      { type: String, required: true },   // links back to Flow.flowKey
    flowId:       { type: mongoose.Schema.Types.ObjectId, ref: 'Flow', required: true },
    triggeredBy:  { type: String, required: true },   // userId or system identifier
    status:       { type: String, enum: ['pending', 'in_progress', 'completed', 'failed', 'cancelled'], default: 'pending' },
    currentStep:  { type: String, default: null },    // stepKey of the active step
    steps:        { type: [StepStateSchema], default: [] },
    data:         { type: mongoose.Schema.Types.Mixed, default: {} }, // shared runtime payload
    startedAt:    { type: Date },
    completedAt:  { type: Date },
  },
  { timestamps: true }
);

// Index for common queries
InstanceSchema.index({ flowKey: 1, status: 1 });
InstanceSchema.index({ triggeredBy: 1 });

module.exports = mongoose.model('FlowInstance', InstanceSchema);
