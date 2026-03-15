const swaggerJsdoc = require("swagger-jsdoc");
const env = require("./env");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Pop Wala API",
      version: "1.0.0",
      description: "Production-ready Node.js Express backend API",
    },
    tags: [
      { name: "Health", description: "Service health endpoints" },
      { name: "Auth", description: "User authentication endpoints" },
      { name: "User", description: "User profile endpoints" },
      { name: "Admin Auth", description: "Admin authentication endpoints" },
      { name: "Admin", description: "Admin management endpoints" },
      { name: "Admin Contractors", description: "Admin contractor management endpoints" },
      { name: "Admin Architects", description: "Admin architect management endpoints" },
      { name: "Contractor", description: "Contractor portal authentication and profile endpoints" },
      { name: "Architect", description: "Architect portal authentication and profile endpoints" },
      { name: "Website Banners", description: "Homepage banner endpoints" },
    ],
    servers: [{ url: env.API_BASE_URL }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ["./src/routes/*.js", "./src/modules/**/*.routes.js"],
};

module.exports = swaggerJsdoc(options);
