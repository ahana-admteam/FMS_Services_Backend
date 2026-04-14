// const express = require("express");

// const router = express.Router();

// const {

//     getAllFmsTasksForUser,
//     getPendingOrOverdueTasks,
//     getAllOverdueTasks

// } = require("../controllers/fmsgettask.controller");


// // Get All Tasks
// router.get(
//     "/findAllFmsTasksForUser",
//     getAllFmsTasksForUser
// );


// // Pending + Overdue
// router.get(
//     "/findAllFmsTasksForUserPendingOrOverdue",
//     getPendingOrOverdueTasks
// );


// // All Overdue Tasks
// router.get(
//     "/findAllFmsOverDueTasks",
//     getAllOverdueTasks
// );


// module.exports = router;

const express = require("express");
const router = express.Router();

const getFmsTasks = require("../../controller/ahanaLibrary/getFmsTasks.controller");

// mount controller
router.use('/', getFmsTasks);



module.exports = router;