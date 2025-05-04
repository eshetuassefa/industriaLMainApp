import express from "express";
import cors from "cors";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./docs/swagger";

import authRoutes from "./routes/auth.routes";
import adminRoutes from "./routes/admin.route"; // Updated to use admin routes
import labResultRouter from "./routes/labResult.route"; // Updated to use lab result routes

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// API Routes
app.use("/api/auth", authRoutes); // Authentication routes
app.use("/api/admin", adminRoutes); // Admin routes to manage staff
app.use("/api/lab-results", labResultRouter);


// Swagger API Documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Home route
app.get("/", (req, res) => {
  res.send("Welcome to Admin APIs");
});

export default app;