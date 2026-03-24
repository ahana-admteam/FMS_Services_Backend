const mongoose = require('mongoose');

/**
 * HISTORY MODEL — immutable audit trail
 *
 * Every time a step transitions (pending → active → completed etc.)
 * a History record is appended. Never updated, only inserted.
 * This gives you a full replay log of any instance.
 */

const HistorySchema = new mongoose.Schema(
  {
    instanceId:  { type: mongoose.Schema.Types.ObjectId, ref: 'FlowInstance', required: true },
    flowKey:     { type: String, required: true },
    stepKey:     { type: String, required: true },
    fromStatus:  { type: String },
    toStatus:    { type: String, required: true },
    actor:       { type: String, default: 'system' }, // who triggered this transition
    note:        { type: String, default: '' },
    payload:     { type: mongoose.Schema.Types.Mixed, default: {} },
    happenedAt:  { type: Date, default: Date.now },
  },
  { timestamps: false }  // happenedAt is our timestamp
);

HistorySchema.index({ instanceId: 1, happenedAt: 1 });

module.exports = mongoose.model('FlowHistory', HistorySchema);
