const express = require("express");
const getFms = express.Router();
const axios = require('axios');
const { fetchUserDetails } = require("../../../helpers/fetchuserDetails");
const { infoLogger, errorLogger } = require("../../../middleware/logger");
const { getRequestContext } = require('../../../utils/requestContext');

// MODELS
const FmsMaster = require("../../models/fmsMaster.model");
const FmsTasks = require("../../models/fmsTasks.model");
const FmsQA = require("../../models/fmsQA.model");

// Router-level middleware to log Authorization header for troubleshooting
getFms.use((req, res, next) => {
  console.log('getFms.router: Authorization header ->', req.headers.authorization);
  next();
});


//find  Single FMS using FMS Name
getFms.post('/findSingleFms', async (req, res) => {
  try {
    const token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({ message: "Authorization header missing" });
    }

    // ✅ Fetch actual user details from token
    const userDetails = await fetchUserDetails(token);

    console.log("userDetails", userDetails);

    const query = { fmsMasterId: req.body.fmsMasterId };
    const document = await FmsMaster.findOne(query);

    res.json({
      message: document,
      status: 200
    });

  } catch (error) {
    console.error("Error in findSingleFms:", error);
    return res.status(500).json({ error: error.message });
  }
});


//find ALL FMS 
getFms.get('/findAllFms', async (req, res) => {
  try {
     const token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({ message: "Authorization header missing" });
    }

    const userDetails = await fetchUserDetails(token);

    console.log("userDetails", userDetails);

    const documents = await FmsMaster.find();

    res.json({
      "message": [documents],
      "status": 200
    })

  }
  catch (error) {
    return res.status(500).json({ error: error.message });
  }
})


//find all fms and their forms the user has access to 
getFms.get('/findFmsQuestionaresForUser', async (req, res) => {

  let userDetails = await fetchUserDetails(req.headers.authorization);
  let userName = userDetails.userName;

  try {

    infoLogger.log("info", `Username: ${userName} hit the api findFmsQuestionaresForUser`)

    const query = {
      $and: [
        { fmsLive: true },
        {
          fmsAccess: {
            $elemMatch: {
              name: userName
            }
          }
        }
      ]
    };

    const documents = await FmsMaster.find(query);

    infoLogger.log("info", `Username: ${userName} successfully fetch all fms questionares:${JSON.stringify(documents)}`)

    res.json({
      "message": documents,
      "status": 200
    })

  } catch (error) {
    errorLogger.log("error" , `Username:${userName} failed to fetch all fms questionares due to ${error.message}`);
    return res.status(500).json({ error: error.message });
  }

})


//findPreviousStepsDetails
getFms.post('/findPreviousStepsDetails', async (req, res) => {

  let userDetails = await fetchUserDetails(req.headers.authorization);
  let userName = userDetails.userName;

  try {

    infoLogger.log("info", `Username: ${userName} hit findPreviousStepsDetails`)

    const document = await FmsMaster.findOne({ fmsMasterId: req.body.fmsMasterId });

    function fetchPreviousSteps(fmsSteps, currentStepId) {
      let previousSteps = [];
      for (let i = 0; i < fmsSteps.length; i++) {
        if (fmsSteps[i].id === currentStepId) {
          for (let j = 0; j < i; j++) {
            previousSteps.push(fmsSteps[j]);
          }
          break;
        }
      }
      return previousSteps;
    }

    const previousSteps = fetchPreviousSteps(document.fmsSteps, req.body.stepId);

    res.json({
      "message": previousSteps,
      "status": 200
    })

  }
  catch (error) {
    errorLogger.log("error" , `Username:${userName} failed to fetch previous steps due to ${error.message}`);
    return res.status(500).json({ error: error.message });
  }
})


//findNextStepsDetails
getFms.post('/findNextStepsDetails', async (req, res) => {

  let userDetails = await fetchUserDetails(req.headers.authorization);
  let userName = userDetails.userName;

  try {

    infoLogger.log("info", `Username: ${userName} hit findNextStepsDetails`)

    const document = await FmsMaster.findOne({ fmsMasterId: req.body.fmsMasterId });

    function fetchNextSteps(fmsSteps, currentStepId) {
      let nextSteps = [];
      for (let i = 0; i < fmsSteps.length; i++) {
        if (fmsSteps[i].id === currentStepId) {
          for (let j = i + 1; j < fmsSteps.length; j++) {
            nextSteps.push(fmsSteps[j]);
          }
          break;
        }
      }
      return nextSteps;
    }

    const nextSteps = fetchNextSteps(document.fmsSteps, req.body.stepId);

    res.json({
      "message": nextSteps,
      "status": 200
    })

  }
  catch (error) {
    errorLogger.log("error" , `Username:${userName} failed to fetch next steps due to ${error.message}`);
    return res.status(500).json({ error: error.message });
  }
})


//findAllDetailsForOneMasterFmstest
getFms.post('/findAllDetailsForOneMasterFmstest', async (req, res) => {

  let userDetails = await fetchUserDetails(req.headers.authorization);
  let userName = userDetails.userName;

  try {

    const fmsMasterDocument = await FmsMaster.findOne({
      fmsMasterId: req.body.fmsMasterId
    });

    const fmsflows = await FmsQA.find({
      fmsMasterId: req.body.fmsMasterId
    });

    let allStepsTasks = [];

    for (let i = 1; i <= fmsMasterDocument.fmsSteps.length; i++) {

      const allTasksForOneFlowForStep = await FmsTasks.find({
        fmsMasterId: req.body.fmsMasterId,
        stepId: i
      });

      allStepsTasks.push(allTasksForOneFlowForStep)
    }

    res.json({
      "message": {
        masterFMS: fmsMasterDocument,
        allFlows: fmsflows,
        allSteps: allStepsTasks,
      },
      "status": 200
    })

  } catch (error) {
    errorLogger.log("error", `Username:${userName} failed to fetch details due to ${error.message}`);
    return res.status(500).json({ error: error.message });
  }

})


// fetch all the questions
getFms.post("/fetchFormQuestions", async (req, res) => {

  let userDetails = await fetchUserDetails(req.headers.authorization);
  let userName = userDetails.userName;

  try {

    const { fmsMasterId } = req.body;

    const document = await FmsMaster.find({ fmsMasterId });

    if (document.length === 0) {
      return res.status(404).json({ error: "No Data Found" })
    }

    const fetchQuestions = document[0].fmsQuestionare;

    let questionBank = [];
    for (let i = 0; i < fetchQuestions.length; i++) {
      const element = fetchQuestions[i];
      if (element.answerType === 'DATE') {
        questionBank.push(element)
      }
    }

    res.json({
      message: "Task fetched successfully",
      questionBank: questionBank,
      status: 200
    });

  } catch (error) {
    errorLogger.log("error" , `Username:${userName} failed to fetch form dates due to ${error.message}`);
    return res.status(500).send({ error: "Failed to fetch form dates", status: 500 });
  }
});


getFms.get('/findHistoricalFms', async (req, res) => {

  let userDetails = await fetchUserDetails(req.headers.authorization);
  let userName = userDetails.userName;

  try {

    const documents = await FmsMaster.find({fmsLive: false , isDraft : false});

    res.json({
      "message": [documents],
      "status": 200
    })

  }
  catch (error) {
    errorLogger.log("error" , `Username:${userName} failed to fetch historical FMS`);
    return res.status(500).json({ error: error.message });
  }
})


getFms.get('/findDraftFms', async (req, res) => {

  let userDetails = await fetchUserDetails(req.headers.authorization);
  let userName = userDetails.userName;

  try {

    const documents = await FmsMaster.find({isDraft : true ,fmsLive: false });

    res.json({
      "message": [documents],
      "status": 200
    })

  }
  catch (error) {
    errorLogger.log("error" , `Username:${userName} failed to fetch draft FMS`);
    return res.status(500).json({ error: error.message });
  }
})


//findallFmsquestion
getFms.post('/findallFmsquestion', async (req, res) => {

  let userDetails = await fetchUserDetails(req.headers.authorization);
  let userName = userDetails.userName;

  try {

    const { fmsMasterId } = req.body;

    const documents = await FmsMaster.find({ fmsMasterId });

    res.json({
      "message": documents,
      "status": 200
    });

  } catch (error) {
    errorLogger.log("error", `Username:${userName} failed to fetch questionnaires`);
    return res.status(500).json({ error: error.message });
  }
});


getFms.post('/findallexternalEmployee', async (req, res) => {

  let userDetails = await fetchUserDetails(req.headers.authorization);
  let userName = userDetails.userName;

  try {

    const { fmsMasterId } = req.body;

    const documents = await FmsMaster.find({ fmsMasterId });

    const filteredSteps = documents.map(doc => {
      return {
        ...doc._doc,
        fmsSteps: doc.fmsSteps.filter(step => step.whatsappData.externalEmployees === true)
      };
    });

    res.json({
      "message": filteredSteps,
      "status": 200
    });

  } catch (error) {
    errorLogger.log("error", `Username:${userName} failed to fetch external employees`);
    return res.status(500).json({ error: error.message });
  }

});


module.exports = getFms;