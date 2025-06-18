import express from "express";
import cors from "cors";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";

import swaggerSpec from "./docs/swagger";

// Route imports
import authRoutes from "./routes/auth.routes";
import adminRoutes from "./routes/admin.route";
import labResultRouter from "./routes/labResult.route";
import receptionRoutes from "./routes/reception.route";
import doctorRoutes from "./routes/doctor.route";
import superadminRoutes from "./routes/superadmin.route";
import radiologistRoutes from "./routes/radiologist.route";
import pharmacyRoutes from "./routes/pharmacy.route";

const app = express();

// Security and middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// API Documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use("/api/auth", authRoutes);
app.use("/refresh-token", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/lab-results", labResultRouter);
app.use("/api/reception", receptionRoutes);
app.use("/api/doctor", doctorRoutes);
app.use("/api/superadmin", superadminRoutes);
app.use("/api/radiology", radiologistRoutes);
app.use("/api/pharmacy", pharmacyRoutes);

// Home route
app.get("/", (req, res) => {
  res.send("Welcome to Admin APIs");
});

export default app;
