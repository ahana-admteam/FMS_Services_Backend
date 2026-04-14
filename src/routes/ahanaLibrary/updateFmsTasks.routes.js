const express = require("express");
const router = express.Router();

const { updateFmsTask } = require("../../controller/ahanaLibrary/updateFmsTasks.controller");

// ROUTE

/**
 * @swagger
 * /api/updatefmstasks:
 *   post:
 *     summary: Update FMS Task and Trigger Next Step
 *     description: Completes current FMS task and triggers next workflow step including T-X and P2P steps.
 *     tags: [FMS Tasks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fmsTaskId
 *               - fmsMasterId
 *               - fmsQAId
 *             properties:
 *               fmsTaskId:
 *                 type: string
 *                 example: "FT-12345"
 *               fmsMasterId:
 *                 type: string
 *                 example: "FM-1001"
 *               fmsQAId:
 *                 type: string
 *                 example: "QA-1001"
 *               formStepsAnswers:
 *                 type: object
 *                 example:
 *                   question1: "Yes"
 *                   question2: "Completed"
 *               fmsTaskQualityDetails:
 *                 type: object
 *                 example:
 *                   qualityCheck: "Passed"
 *                   remarks: "All good"
 *     responses:
 *       200:
 *         description: Task updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Task updated and next step triggered
 *                 status:
 *                   type: number
 *                   example: 200
 *       404:
 *         description: FMS Master not found
 *       500:
 *         description: Server Error
 */
router.post("/", updateFmsTask);

module.exports = router;