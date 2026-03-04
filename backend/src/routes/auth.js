import express from "express";

const router = express.Router();

// Routes d'authentification - placeholder pour l'instant
router.post("/register", (req, res) => {
  res.json({ message: "Register endpoint - à implémenter" });
});

router.post("/login", (req, res) => {
  res.json({ message: "Login endpoint - à implémenter" });
});

router.post("/logout", (req, res) => {
  res.json({ message: "Logout endpoint - à implémenter" });
});

export default router;
