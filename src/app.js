const express = require('express');
const app = express();

const routes = require('./routes/index');
const { errorHandler } = require('./common/middleware/errorHandler');
const { requestLogger } = require('./common/middleware/requestLogger');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

app.use('/api', routes);

// Global error handler — must be last
app.use(errorHandler);

module.exports = app;
