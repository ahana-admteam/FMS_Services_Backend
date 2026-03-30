const express = require('express');
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");
const app = express();

const swaggerSpec = require("../src/routes/swagger");
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const routes = require('./routes/index');
const { errorHandler } = require('./common/middleware/errorHandler');
const { requestLogger } = require('./common/middleware/requestLogger');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// Direct routes
const submitQA = require("../src/flows/library/submitFmsQuestionare");
app.use("/submitQA", submitQA);

app.use('/api', routes);

// Global error handler — must be last
app.use(errorHandler);

module.exports = app;
