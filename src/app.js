const express = require('express');
const swaggerUi = require("swagger-ui-express");
const app = express();
const cors = require("cors");

const swaggerSpec = require("../src/routes/swagger/swagger");
const questionareRoutes = require("../src/routes/ahanaLibrary/submitQuestionare.routes");

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api/questionare", questionareRoutes);

//Test APIs
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'Running',
    service: 'fms-backend',
    port: 4000,
    timestamp: new Date().toISOString()
  });
});

module.exports = app;