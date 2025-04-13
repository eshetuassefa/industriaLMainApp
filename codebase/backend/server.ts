import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { json } from "body-parser";
import registerStaffRoutes from "./route/admin.route"; 

dotenv.config(); // Load environment variables from .env

const app = express();

// Middleware
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded data

// Register Routes
app.use("/admin", registerStaffRoutes); // Register the staff routes (make sure path is correct)

// Handle Errors (Optional)
app.use((err: any, req: any, res: any, next: any) => {
  console.error(err);
  res
    .status(500)
    .json({ message: "Internal Server Error", error: err.message });
});

// Start the server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
