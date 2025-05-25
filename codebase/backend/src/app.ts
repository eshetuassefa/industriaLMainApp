import { LabResult } from './../node_modules/.prisma/client/index.d';
import express from "express";
import cors from "cors";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./docs/swagger";

import authRoutes from "./routes/auth.routes";
import adminRoutes from "./routes/admin.route"; // Updated to use admin routes
import labResultRouter from "./routes/labResult.route"; // Updated to use lab result routes
import receptionRoutes from "./routes/rescptions.route";  
import doctorRoutes from "./routes/doctor.route";    
import superadminRoutes from "./routes/superadmin.route"; // Updated to use superadmin routes
import radiologistRoutes from "./routes/radiologist.route"; // Radiologist routes
const app = express();

// Security middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// API Routes
app.use("/api/auth", authRoutes); // Authentication routes
app.use("/api/admin", adminRoutes); // Admin routes to manage staff
app.use("/api/lab-results", labResultRouter);
app.use('/api/reception', receptionRoutes);  
app.use('/api/doctor', doctorRoutes);  
app.use("/api/superadmin", superadminRoutes);
app.use("/api/radiology", radiologistRoutes); // Radiologist routes
// Swagger API Documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Home route
app.get("/", (req, res) => {
  res.send("Welcome to Admin APIs");
});

export default app;