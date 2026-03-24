const mongoose = require('mongoose');

/**
 * FLOW MODEL — blueprint / template
 *
 * A Flow is a reusable definition of a process.
 * It describes what steps exist, their order, and their type.
 * Think of it as a class; FlowInstance is the object.
 *
 * Example:
 *   Flow: "Library Book Borrow"
 *     steps: [search, reserve, checkout, return]
 */

const StepDefinitionSchema = new mongoose.Schema(
  {
    stepKey:     { type: String, required: true },   // unique key within this flow e.g. "reserve"
    label:       { type: String, required: true },   // human-readable name
    type:        { type: String, enum: ['manual', 'auto', 'approval', 'notify'], default: 'manual' },
    order:       { type: Number, required: true },   // execution order (ascending)
    description: { type: String, default: '' },
    meta:        { type: mongoose.Schema.Types.Mixed, default: {} }, // any extra step-level config
  },
  { _id: false }
);

const FlowSchema = new mongoose.Schema(
  {
    flowKey:     { type: String, required: true, unique: true }, // e.g. "library-borrow"
    name:        { type: String, required: true },
    description: { type: String, default: '' },
    version:     { type: Number, default: 1 },
    isActive:    { type: Boolean, default: true },
    steps:       { type: [StepDefinitionSchema], default: [] },
    meta:        { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Flow', FlowSchema);
