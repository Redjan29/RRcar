import express from "express";
import { authMiddleware, adminMiddleware } from "../middlewares/auth.js";
import {
  getAllReservations,
  updateReservationStatus,
  getAllUsers,
  getDashboardStats,
  updateUser
} from "../controllers/adminController.js";

const router = express.Router();

// Toutes les routes admin nécessitent auth + admin
router.use(authMiddleware, adminMiddleware);

// Dashboard stats
router.get("/stats", getDashboardStats);

// Gestion des réservations
router.get("/reservations", getAllReservations);
router.patch("/reservations/:id/status", updateReservationStatus);

// Gestion des utilisateurs
router.get("/users", getAllUsers);
router.patch("/users/:id", updateUser);

export default router;
