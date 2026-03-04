import express from "express";
import {
  cancelMyReservation,
  createReservation,
  deleteReservation,
  getMyReservations,
  getReservationById,
  updateReservation,
} from "../controllers/reservationsController.js";
import { authMiddleware } from "../middlewares/auth.js";

const router = express.Router();

router.post("/", createReservation);
router.get("/my", authMiddleware, getMyReservations);
router.patch("/my/:id/cancel", authMiddleware, cancelMyReservation);
router.get("/:id", getReservationById);
router.put("/:id", updateReservation);
router.delete("/:id", deleteReservation);

export default router;
