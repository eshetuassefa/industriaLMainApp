import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "eHealth API",
      version: "1.0.0",
      description: "API for managing lab test results, healthcare data, etc.",
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT", // expected format of token (Bearer JWT)
        },
      },
      schemas: {
        Person: {
          type: "object",
          properties: {
            id: { type: "string", example: "clv3ql9zz0000u30l2q8h3wj4" },
            firstName: { type: "string", example: "John" },
            lastName: { type: "string", example: "Doe" },
            phone: { type: "string", example: "+251901234567" },
            email: { type: "string", example: "john@example.com" },
            sex: { type: "string", example: "male" },
            role: { type: "string", example: "admin" },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }], // Apply to all routes globally unless overridden
  },
  apis: ["./src/routes/**/*.ts"], // ✅ FIXED: recursive include
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
