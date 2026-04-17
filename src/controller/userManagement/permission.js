const express = require("express");
const permission = express.Router();
const axios = require("axios");
const { fetchUserDetails } = require("../../../helpers/fetchuserDetails");


// MODELS
const FmsTasks = require("../../models/fmsTasks.model");
const FmsMaster = require("../../models/fmsMaster.model");
const FmsQA = require("../../models/fmsQA.model");


permission.post("/permissionSteps", async (req, res) => {
  try {
    const token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({ message: "Authorization header missing" });
    }

    const userDetails = await fetchUserDetails(token);

    let { department, fmsName, StepId } = req.query;

    // ✅ Expect employees array from body: [{ empId, empName }, ...]
    const { employees } = req.body;

    if (!fmsName || !StepId || !department) {
      return res.status(400).json({ message: "fmsName, StepId, and department are required" });
    }

    if (!employees || !Array.isArray(employees) || employees.length === 0) {
      return res.status(400).json({ message: "employees array is required in body" });
    }

    // ✅ Update employees inside the matching step -> matching department
    const updated = await FmsMaster.updateOne(
  {
    fmsName,
    "fmsSteps.step": parseInt(StepId)
  },
  {
    $push: {
      "fmsSteps.$.who": {
        $each: employees
      }
    }
  }
);

    if (updated.matchedCount === 0) {
      return res.status(404).json({ message: "No matching document found" });
    }

    if (updated.modifiedCount === 0) {
      return res.status(200).json({ message: "No changes made (already exists or no match)" });
    }

    // ✅ Fetch updated document to return
    const updatedDoc = await FmsMaster.findOne({ fmsName });

    res.json({
      message: "Employees updated successfully",
      fmsMaster: updatedDoc
    });

  } catch (error) {
    console.error("Error in permissionSteps:", error);
    return res.status(500).json({ error: error.message });
  }
});


module.exports = permission;