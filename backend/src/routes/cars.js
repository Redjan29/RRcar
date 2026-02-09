import express from "express";
import {
  getCars,
  getCarById,
  getAvailableCars,
  seedCars,
} from "../controllers/carsController.js";

const router = express.Router();

router.get("/", getCars);
router.get("/available", getAvailableCars);
router.get("/:id", getCarById);
router.post("/seed", seedCars);

export default router;
