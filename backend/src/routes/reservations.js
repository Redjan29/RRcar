import express from "express";
import {
  createReservation,
  deleteReservation,
  getReservationById,
  updateReservation,
} from "../controllers/reservationsController.js";

const router = express.Router();

router.post("/", createReservation);
router.get("/:id", getReservationById);
router.put("/:id", updateReservation);
router.delete("/:id", deleteReservation);

export default router;
