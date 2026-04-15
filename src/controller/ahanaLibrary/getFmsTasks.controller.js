const express = require("express");
const getFmsTasks = express.Router();
var MongoClient = require('mongodb').MongoClient;
const axios = require('axios');
const moment = require('moment-timezone');
const { fetchUserDetails } = require("../../../helpers/fetchuserDetails");
const { infoLogger, errorLogger } = require("../../../middleware/logger");

// MODELS
const FmsTasks = require("../../models/fmsTasks.model");
const FmsMaster = require("../../models/fmsMaster.model");
const FmsQA = require("../../models/fmsQA.model");


//find ALL FMS Tasks FOR A USER 
getFmsTasks.get('/findAllFmsTasksForUser', async (req, res) => {

    let userDetails = await fetchUserDetails(req.headers.authorization);
    let userName = userDetails.userName;
    let userID = userDetails.userID;
    let userEmail = userDetails.userEmail;

    try {

        infoLogger.log("info", `Username: ${userName} hit the api findAllFmsTasksForUser`)

        const documents = await FmsTasks.find({ "fmsTaskDoer.employeeId": userID });

        console.log("documents", documents);

        res.json({
            "message": [documents],
            "status": 200
        })

    }
    catch (error) {
        console.error('Error', error);
        errorLogger.log("error" , `Username:${userName} failed to fetch all fms tasks due to ${error.message}`);
        return res.status(500).json({ error: error.message });
    }
})


//find ALL FMS Tasks FOR A USER THAT ARE DUE TODAY AND ALL OVERDUE TASKS
getFmsTasks.get('/findAllFmsTasksForUserPendingOrOverdue', async (req, res) => {

    let userDetails = await fetchUserDetails(req.headers.authorization);
    let userName = userDetails.userName;
    let userID = userDetails.userID;
    let userEmail = userDetails.userEmail;

    try {

        infoLogger.log("info", `Username: ${userName} hit the api findAllFmsTasksForUserPendingOrOverdue`)

        const pendingTasks = await FmsTasks.find({
            fmsTaskStatus: 'PENDING',
            'fmsTaskDoer.employeeId': userID
        });

        const currentTimeIST = moment().tz('Asia/Kolkata').format();

        for (const task of pendingTasks) {

            if (task.fmsTaskPlannedCompletionTime < currentTimeIST) {
                await FmsTasks.updateOne(
                    { fmsTaskId: task.fmsTaskId },
                    { $set: { fmsTaskStatus: 'OVERDUE' } }
                );
            }
        }

    } catch (error) {
        console.error('Error', error);
        return res.status(500).json({ error: error.message });
    }

    try {

        const documents = await FmsTasks.find({
            "fmsTaskDoer.employeeId": userID,
            $or: [
                { fmsTaskStatus: "PENDING" },
                { fmsTaskStatus: "OVERDUE" }
            ]
        });

        res.json({
            "message": [documents],
            "status": 200
        })

    }
    catch (error) {
        console.error('Error', error);
        errorLogger.log("error" , `Username:${userName} failed to fetch pending or overdue`);
        return res.status(500).json({ error: error.message });
    }
})


//ALL OVERDUE tasks
getFmsTasks.get('/findAllFmsOverDueTasks', async (req, res) => {

    let userDetails = await fetchUserDetails(req.headers.authorization);
    let userName = userDetails.userName;

    try {

        const documents = await FmsTasks.find({ fmsTaskStatus: "OVERDUE" });

        res.json({
            "message": [documents],
            "status": 200
        })

    }
    catch (error) {
        console.error('Error', error);
        return res.status(500).json({ error: error.message });
    }
})


//ALL PENDING tasks
getFmsTasks.get('/findAllFmsPendingTasks', async (req, res) => {

    let userDetails = await fetchUserDetails(req.headers.authorization);
    let userName = userDetails.userName;

    try {

        const documents = await FmsTasks.find({ fmsTaskStatus: "PENDING" });

        res.json({
            "message": [documents],
            "status": 200
        })

    }
    catch (error) {
        console.error('Error', error);
        return res.status(500).json({ error: error.message });
    }
})


//ALL OVERDUE tasks for user
getFmsTasks.get('/findAllFmsOverdueTasksForUser', async (req, res) => {

    let userDetails = await fetchUserDetails(req.headers.authorization);
    let userName = userDetails.userName;
    let userID = userDetails.userID;

    try {

        const documents = await FmsTasks.find({
            fmsTaskStatus: "OVERDUE",
            "fmsTaskDoer.employeeId": userID
        });

        res.json({
            "message": [documents],
            "status": 200
        })

    }
    catch (error) {
        console.error('Error', error);
        return res.status(500).json({ error: error.message });
    }
})


//All Tasks for PC
getFmsTasks.get('/findAllFmsOverdueTasksForPc', async (req, res) => {

    let userDetails = await fetchUserDetails(req.headers.authorization);
    let userName = userDetails.userName;

    let fmsMasterIds = [];

    try {

        const documents = await FmsMaster.find({
            "fmsProcess.processCoordinatorName": userName
        });

        fmsMasterIds = documents.map(doc => doc.fmsMasterId);

    }
    catch (error) {
        console.error('Error', error);
        return res.status(500).json({ error: error.message });
    }

    let overDueTasksForPc;

    try {

        overDueTasksForPc = await FmsTasks.find({
            fmsMasterId: { $in: fmsMasterIds },
            fmsTaskStatus: "OVERDUE"
        });

    }
    catch (error) {
        console.error('Error', error);
        return res.status(500).json({ error: error.message });
    }

    res.json({
        "message": [overDueTasksForPc],
        "status": 200
    })
})

module.exports = getFmsTasks;