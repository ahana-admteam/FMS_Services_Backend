const express = require("express");
const submitFmsQuestionare = express.Router();
const { MongoClient } = require("mongodb");
const moment = require("moment");
const {
  CurrentIST
} = require("../../../helpers/convertGMTtoIST");
const { calculateFmsPlannedCompletionTime } = require("../../../helpers/calculateFmsPlannedCompleationTime");
const { infoLogger } = require("../../../middleware/logger");

// API: Submit FMS QA and create initial task (Step 1)
/**
 * @swagger
 * /submitQA/submitFmsUserQAcreateTaskStep1:
 *   post:
 *     summary: Submit FMS QA and create Task Step 1
 *     tags:
 *       - FMS QA
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fmsName
 *               - fmsMasterID
 *               - fmsQA
 *             properties:
 *               fmsName:
 *                 type: string
 *                 example: "app Ahana Library"
 *               fmsMasterID:
 *                 type: integer
 *                 example: 2
 *               fmsQA:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - id
 *                     - question
 *                     - required
 *                     - answerType
 *                     - answer
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "41c75229-180c-42e7-9d05-49e82eb98bda"
 *                     question:
 *                       type: string
 *                       example: "Requester Name"
 *                     required:
 *                       type: boolean
 *                       example: true
 *                     answerType:
 *                       type: string
 *                       example: "TEXT"
 *                     allowedAnswers:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: []
 *                     isStartDate:
 *                       type: boolean
 *                       example: false
 *                     answer:
 *                       type: string
 *                       example: "Veeranna"
 *     responses:
 *       200:
 *         description: Successfully submitted
 */
submitFmsQuestionare.post('/submitFmsUserQAcreateTaskStep1', async (req, res) => {
  console.log(req.body);

  // Temporary mock user (replace with auth later)
  const userName = "Test User";
  const userID = 1;
  const companyUrl = "ahana";
  const userEmail = "test@gmail.com";

  let fmsQAId;
  const fmsTemp = req.body;

  try {
    const client = await MongoClient.connect(process.env.MONGO_URI);
    const db = client.db(companyUrl);
    const collection = db.collection('fms');

    infoLogger.log("info",
      `User:${userName} | Company:${companyUrl} | API: submitFmsUserQAcreateTaskStep1 | Body:${JSON.stringify(req.body)}`
    );

    // Generate incremental fmsQAId
    const lastDoc = await collection.find().sort({ _id: -1 }).limit(1).toArray();
    fmsQAId = lastDoc.length > 0 ? lastDoc[0].fmsQAId + 1 : 1;

    // Insert QA
    await collection.insertOne({
      fmsQAId,
      fmsQACreatedBy: { userID, userEmail, userName },
      fmsMasterId: req.body.fmsMasterID,
      fmsName: req.body.fmsName,
      fmsQA: req.body.fmsQA,
      fmsQAisLive: true
    });

    await client.close();
  } catch (error) {
    console.error('Error inserting QA:', error);
    return res.status(500).json({ error: 'Error Submitting QA' });
  }

  // Increment noOfLive in fmsMaster
  try {
    const client = await MongoClient.connect(process.env.MONGO_URI);
    const db = client.db(companyUrl);

    await db.collection('fmsMaster').findOneAndUpdate(
      { fmsMasterId: req.body.fmsMasterID },
      { $inc: { noOfLive: 1 } }
    );

    await client.close();
  } catch (error) {
    console.error('Error updating fmsMaster:', error);
    return res.status(500).json({ error: error.message });
  }

  //Fetch fmsMaster document
  let fmsMaster;
  try {
    const client = await MongoClient.connect(process.env.MONGO_URI);
    const db = client.db(companyUrl);

    fmsMaster = await db.collection('fmsMaster')
      .findOne({ fmsMasterId: req.body.fmsMasterID });

    await client.close();
  } catch (error) {
    console.error('Error fetching fmsMaster:', error);
    return res.status(500).json({ error: error.message });
  }

 //Step 1 Task Creation (A2P or T-X logic)
  const firstStep = fmsMaster.fmsSteps[0];

  if (firstStep.plannedDate.type !== "T-X") {
    await createInitialTask(companyUrl, fmsMaster, req, fmsQAId);
    await nextP2Psteps(companyUrl, fmsMaster, fmsMaster.fmsSteps, firstStep.id, fmsQAId);
  } else {
    const txSteps = fmsMaster.fmsSteps.filter(step => step.plannedDate.type === "T-X");
    if (txSteps.length > 0) {
      await createTxSteps(companyUrl, fmsMaster, txSteps, fmsQAId, req.body.fmsQA);
    }
  }

  return res.json({
    message: "Requester form submitted and Step 1 task created",
    status: 200
  });
});



module.exports = submitFmsQuestionare;
