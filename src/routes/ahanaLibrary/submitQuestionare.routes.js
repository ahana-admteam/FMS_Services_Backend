const express = require("express");
const router = express.Router();

const submitFmsQuestionare = require("../../controller/ahanaLibrary/submitQuestionare.controller");

//Define routes
/**
 * @swagger
 * /api/questionare/submitFmsUserQAcreateTaskStep1:
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
 *             properties:
 *               fmsName:
 *                 type: string
 *               fmsMasterID:
 *                 type: integer
 *               fmsQA:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       200:
 *         description: Success
 */
router.use('/', submitFmsQuestionare);

module.exports = router;