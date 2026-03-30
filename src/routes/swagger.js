const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "FMS API",
      version: "1.0.0",
    },
    servers: [
      {
        url: "http://localhost:4000",
        //  url: "/fms_api",
      },
    ],
  },
  apis: ["./src/flows/**/*.js"]
};

module.exports = swaggerJsdoc(options);