const { MongoClient } = require("mongodb");
const moment = require("moment-timezone");

const { fetchuserDetails } = require("../../helpers/fetchuserDetails");
const { infoLogger, errorLogger } = require("../../middleware/logger");


// GET ALL FMS TASKS FOR USER
const getAllFmsTasksForUser = async (req, res) => {

    let userDetails = await fetchuserDetails(req.headers.authorization);

    let userName = userDetails.userName;
    let userID = userDetails.userID;
    // let companyUrl = userDetails.companyUrl;

    try {

        const client = await MongoClient.connect(process.env.MONGO_DB_STRING);

        // const db = client.db(companyUrl);
        const collection = db.collection("fmsTasks");

        infoLogger.log("info",
            `Username: ${userName} from company: ${companyUrl} hit getAllFmsTasksForUser`
        );

        const data = await collection
            .find({ "fmsTaskDoer.employeeId": userID })
            .toArray();

        await client.close();

        res.json({
            message: data,
            status: 200
        });

    } catch (error) {

        errorLogger.log("error",
            `Username:${userName} failed to fetch tasks ${error.message}`
        );

        res.status(500).json({
            error: error.message
        });
    }
};

// GET PENDING + OVERDUE TASKS
const getPendingOrOverdueTasks = async (req, res) => {

    let userDetails = await fetchuserDetails(req.headers.authorization);

    let userName = userDetails.userName;
    let userID = userDetails.userID;
    // let companyUrl = userDetails.companyUrl;

    try {

        const client = await MongoClient.connect(process.env.MONGO_DB_STRING);

        // const db = client.db(companyUrl);
        const collection = db.collection("fmsTasks");

        infoLogger.log("info",
            `Username: ${userName} hit getPendingOrOverdueTasks`
        );

        const pendingTasks = await collection.find({
            fmsTaskStatus: "PENDING",
            "fmsTaskDoer.employeeId": userID
        }).toArray();

        const currentTimeIST = moment()
            .tz("Asia/Kolkata")
            .format();

        for (const task of pendingTasks) {

            if (task.fmsTaskPlannedCompletionTime < currentTimeIST) {

                await collection.updateOne(
                    { fmsTaskId: task.fmsTaskId },
                    { $set: { fmsTaskStatus: "OVERDUE" } }
                );
            }
        }

        const data = await collection.find({

            "fmsTaskDoer.employeeId": userID,
            $or: [
                { fmsTaskStatus: "PENDING" },
                { fmsTaskStatus: "OVERDUE" }
            ]

        }).toArray();

        await client.close();

        res.json({
            message: data,
            status: 200
        });

    } catch (error) {

        errorLogger.log("error",
            `Error fetching pending tasks ${error.message}`
        );

        res.status(500).json({
            error: error.message
        });
    }
};

// GET ALL OVERDUE TASKS
const getAllOverdueTasks = async (req, res) => {

    let userDetails = await fetchuserDetails(req.headers.authorization);

    let userName = userDetails.userName;
    // let companyUrl = userDetails.companyUrl;

    try {

        const client = await MongoClient.connect(process.env.MONGO_DB_STRING);

        // const db = client.db(companyUrl);
        const collection = db.collection("fmsTasks");

        const data = await collection
            .find({ fmsTaskStatus: "OVERDUE" })
            .toArray();

        await client.close();

        res.json({
            message: data,
            status: 200
        });

    } catch (error) {

        errorLogger.log("error",
            `Error fetching overdue tasks ${error.message}`
        );

        res.status(500).json({
            error: error.message
        });
    }
};



module.exports = {

    getAllFmsTasksForUser,
    getPendingOrOverdueTasks,
    getAllOverdueTasks

};