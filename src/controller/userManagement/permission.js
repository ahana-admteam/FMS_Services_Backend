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

    // ✅ Expect employees array from body: [{ empId, empName }, ...]
    const {department, fmsName, StepId, employees } = req.body;

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

permission.post("/permissionViewfms", async (req, res) => {
  try {
    const token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({ message: "Authorization header missing" });
    }

    const userDetails = await fetchUserDetails(token);

     const {department, fmsName, employees } = req.body;

    if (!fmsName || !department) {
      return res.status(400).json({ message: "fmsName, and department are required" });
    }

    if (!employees || !Array.isArray(employees) || employees.length === 0) {
      return res.status(400).json({ message: "employees array is required in body" });
    }

    // ✅ Update employees inside the matching step -> matching department
    const updated = await FmsMaster.updateOne(
  {
    $push: {
      "fmsAccess": {
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

permission.post("/permissionRequestForm", async (req, res) => {
  try {
    const token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({ message: "Authorization header missing" });
    }

    const userDetails = await fetchUserDetails(token);
    
     const {department, requestForm, employees } = req.body;

    if (!requestForm || !department) {
      return res.status(400).json({ message: "requestForm, and department are required" });
    }

    if (!employees || !Array.isArray(employees) || employees.length === 0) {
      return res.status(400).json({ message: "employees array is required in body" });
    }

    // ✅ Update employees inside the matching step -> matching department
    const updated = await FmsMaster.updateOne(
  {
    $push: {
      "requestFormAccess": {
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
    const updatedDoc = await FmsMaster.findOne({ requestForm });

    res.json({
      message: "Employees updated successfully",
      fmsMaster: updatedDoc
    });

  } catch (error) {
    console.error("Error in permissionSteps:", error);
    return res.status(500).json({ error: error.message });
  }
});


permission.post("/deleteuserAccessRequestform", async (req, res) => {
  try {
    const token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({ message: "Authorization header missing" });
    }

    const userDetails = await fetchUserDetails(token);

    const { requestForm, empIds } = req.body;

    if (!requestForm || !empIds || !Array.isArray(empIds)) {
      return res.status(400).json({
        message: "requestForm and empIds (array) are required"
      });
    }

    // ✅ Remove multiple empIds from requestFormAccess
    await FmsMaster.updateOne(
      { requestForm },
      {
        $pull: {
          requestFormAccess: {
            empId: { $in: empIds }
          }
        }
      }
    );

    // ✅ Fetch updated document
    const updatedDoc = await FmsMaster.findOne({ requestForm });

    res.json({
      message: "Employees removed from requestFormAccess successfully",
      fmsMaster: updatedDoc
    });

  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: error.message });
  }
});


permission.post("/deleteuserAccessSteps", async (req, res) => {
  try {
    const token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({ message: "Authorization header missing" });
    }

    const userDetails = await fetchUserDetails(token);

    const { fmsName, empIds, StepId } = req.body;

    if (!fmsName || !empIds || !Array.isArray(empIds) || !StepId) {
      return res.status(400).json({
        message: "fmsName, StepId and empIds (array) are required"
      });
    }

    // ✅ Remove empIds from specific step's "who"
    await FmsMaster.updateOne(
      {
        fmsName,
        "fmsSteps.step": parseInt(StepId)
      },
      {
        $pull: {
          "fmsSteps.$.who": {
            empId: { $in: empIds }
          }
        }
      }
    );

    // ✅ Fetch updated document
    const updatedDoc = await FmsMaster.findOne({ fmsName });

    res.json({
      message: "Employees removed from step successfully",
      fmsMaster: updatedDoc
    });

  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: error.message });
  }
});

permission.post("/deleteuserAccessViewFMS", async (req, res) => {
  try {
    const token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({ message: "Authorization header missing" });
    }

    const userDetails = await fetchUserDetails(token);

    const { fmsName, empIds } = req.body;

    if (!fmsName || !empIds || !Array.isArray(empIds)) {
      return res.status(400).json({
        message: "fmsName and empIds (array) are required"
      });
    }

    // ✅ Remove multiple empIds from requestFormAccess
    await FmsMaster.updateOne(
      { fmsName },
      {
        $pull: {
          fmsAccess: {
            empId: { $in: empIds }
          }
        }
      }
    );

    // ✅ Fetch updated document
    const updatedDoc = await FmsMaster.findOne({ fmsName });

    res.json({
      message: "Employees removed from View fmsAccess successfully",
      fmsMaster: updatedDoc
    });

  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: error.message });
  }
});

module.exports = permission;