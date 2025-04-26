import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "eHealth API",
      version: "1.0.0",
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
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
    security: [{ bearerAuth: [] }],
  },
  apis: ["./src/routes/*.ts"],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
