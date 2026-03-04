import express from "express";
import { register, login, getProfile, activateAccount } from "../controllers/authController.js";
import { authMiddleware } from "../middlewares/auth.js";
import { User } from "../models/index.js";

const router = express.Router();

// Routes publiques
router.post("/register", register);
router.post("/login", login);
router.post("/activate-account", activateAccount);

// TEMPORAIRE : Route pour devenir admin (À RETIRER EN PRODUCTION)
router.post("/make-admin/:email", async (req, res, next) => {
  try {
    const user = await User.findOneAndUpdate(
      { email: req.params.email.toLowerCase() },
      { isAdmin: true },
      { new: true }
    ).select("-password");
    
    if (!user) {
      const err = new Error("User not found");
      err.status = 404;
      throw err;
    }
    
    res.json({ data: user, message: `${user.firstName} est maintenant admin !` });
  } catch (error) {
    next(error);
  }
});

// Routes protégées (nécessitent un token)
router.get("/profile", authMiddleware, getProfile);

export default router;
