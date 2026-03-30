const mongoose = require("mongoose");

const fmsMasterSchema = new mongoose.Schema({}, { strict: false });

module.exports = mongoose.model("fmsMaster", fmsMasterSchema, "fmsMaster");