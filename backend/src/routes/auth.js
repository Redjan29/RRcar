import express from "express";
import { register, login, getProfile, activateAccount } from "../controllers/authController.js";
import { authMiddleware } from "../middlewares/auth.js";

const router = express.Router();

// Routes publiques
router.post("/register", register);
router.post("/login", login);
router.post("/activate-account", activateAccount);

// Routes protégées (nécessitent un token)
router.get("/profile", authMiddleware, getProfile);

export default router;
