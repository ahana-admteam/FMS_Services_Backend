// const express = require('express');
// const swaggerUi = require("swagger-ui-express");
// const app = express();
// const cors = require("cors");


// const requestContextMiddleware = require("../middleware/requestContextMiddleware");

// const swaggerSpec = require("../src/routes/swagger/swagger");
// const questionareRoutes = require("../src/routes/ahanaLibrary/submitQuestionare.routes");
// const updateFmsTaskRoutes = require("../src/routes/ahanaLibrary/updateFmsTasks.routes");
// const getFmsRoutes = require("../src/routes/ahanaLibrary/getFms.routes");
// const getFmsMasterDataRoutes = require("../src/routes/ahanaLibrary/getFmsMasterData.routes");
// const { getRequestContext } = require('../utils/requestContext');
// const getUserDetails = require("../src/user/user"); 


// // Middlewares
// app.use(cors());
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(requestContextMiddleware);
// // Routes
// app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
// app.use("/api/questionare", questionareRoutes);
// app.use("/api/updatefmstasks", updateFmsTaskRoutes);
// app.use("/api/getfms", getFmsRoutes);
// app.use("/api/getfmsmaster", getFmsMasterDataRoutes);

// //Test APIs
// app.get('/api/health', (req, res) => {
//   res.status(200).json({
//     status: 'Running',
//     service: 'fms-backend',
//     port: 4000,
//     timestamp: new Date().toISOString()
//   });
// });

// // Simple route that calls the user helper
// app.get('/api/user/getDetail', async (req, res) => {
//   const auth = req.headers.authorization || req.headers.Authorization;
//   if (!auth || !auth.startsWith('Bearer')) return res.status(401).json({ error: 'Missing Authorization header' });
//   const token = auth.split(' ')[1];
//   try {
//     const result = await getUserDetails(token);
//     return res.status(200).json({ success: true, data: result });
//   } catch (err) {
//     console.error('Error in /api/user/getDetails:', err.message || err);
//     return res.status(500).json({ success: false, message: err?.response?.data || err.message || 'Failed' });
//   }
// });

// app.post("/test", (req, res) => {
//   const user = getRequestContext();
//   console.log("Controller Data:", user);
//   res.json({
//     message: "Test Success",
//     data: user
//   });

// });

// module.exports = app;

const express = require('express');
const swaggerUi = require("swagger-ui-express");
const app = express();
const cors = require("cors");

// Import Middlewares
const requestContextMiddleware = require("../middleware/requestContextMiddleware");

// Import Swagger
const swaggerSpec = require("../src/routes/swagger/swagger");

// Import Routes
const questionareRoutes = require("../src/routes/ahanaLibrary/submitQuestionare.routes");
const updateFmsTaskRoutes = require("../src/routes/ahanaLibrary/updateFmsTasks.routes");
const getFmsRoutes = require("../src/routes/ahanaLibrary/getFms.routes");
const getFmsMasterDataRoutes = require("../src/routes/ahanaLibrary/getFmsMasterData.routes");
const getFmsTasksRoutes = require("../src/routes/ahanaLibrary/getFmsTasks.routes");
const getfilterfmsDeptRoutes = require("../src/routes/ahanaLibrary/getfilterfmsDept.routes");
const getfilterAdminRoutes = require("../src/routes/ahanaLibrary/getfilterAdmin.routes");
const getfilterDoerRoutes = require("../src/routes/ahanaLibrary/getfilterDoer.routes");
// Import Utils
const { getRequestContext } = require('../utils/requestContext');
const getUserDetails = require('./user/user');

// Import Service (NEW)


// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestContextMiddleware);


// Routes
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api/questionare", questionareRoutes);
app.use("/api/updatefmstasks", updateFmsTaskRoutes);
app.use("/api/getfms", getFmsRoutes);
app.use("/api/getfmsmaster", getFmsMasterDataRoutes);
app.use("/api/getFmsTasks", getFmsTasksRoutes);
app.use("/api/getfilterfmsDept", getfilterfmsDeptRoutes);
app.use("/api/getfilterAdmin", getfilterAdminRoutes);
app.use("/api/getfilterDoer", getfilterDoerRoutes);


// Health Check API
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'Running',
    service: 'fms-backend',
    port: 4000,
    timestamp: new Date().toISOString()
  });
});


// Test API
app.post("/test", (req, res) => {
  const user = getRequestContext();
  console.log("Controller Data:", user);
  
  res.json({
    message: "Test Success",
    data: user
  });
});


// ==========================
// Get User Details API (NEW)
// ==========================
app.post("/api/getUserDetails", async (req, res) => {
  try {

    const { token, emp_email } = req.body;

    console.log("Route token:", token);
    console.log("Route emp_email:", emp_email);

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Token is required"
      });
    }

    const userDetails = await getUserDetails(token,emp_email);

    res.status(200).json({
      success: true,
      data: userDetails
    });

  } catch (error) {

    console.error("Error in getUserDetails route:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch user details",
      error: error.message
    });

  }
});


module.exports = app;