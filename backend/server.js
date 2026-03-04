import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./src/config/db.js";
import { errorHandler } from "./src/middlewares/errorHandler.js";
import healthRoutes from "./src/routes/health.js";
import authRoutes from "./src/routes/auth.js";
import carsRoutes from "./src/routes/cars.js";
import reservationsRoutes from "./src/routes/reservations.js";
import adminRoutes from "./src/routes/admin.js";

dotenv.config();
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use("/", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/cars", carsRoutes);
app.use("/api/reservations", reservationsRoutes);
app.use("/api/admin", adminRoutes);

// Error handling middleware
app.use(errorHandler);

// Database connection
await connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
  console.log(`📝 API docs:`);
  console.log(`   GET http://localhost:${PORT}/`);
  console.log(`   POST http://localhost:${PORT}/api/auth/register`);
  console.log(`   GET http://localhost:${PORT}/api/cars`);
  console.log(`   POST http://localhost:${PORT}/api/reservations`);
});
