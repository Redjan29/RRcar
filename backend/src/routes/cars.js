import express from "express";

const router = express.Router();

// Routes des véhicules - placeholder pour l'instant
router.get("/", (req, res) => {
  res.json({ message: "GET /cars - Liste des véhicules - à implémenter" });
});

router.get("/:id", (req, res) => {
  res.json({ message: "GET /cars/:id - Détails d'une voiture - à implémenter" });
});

router.get("/available", (req, res) => {
  res.json({ message: "GET /cars/available - Voitures disponibles - à implémenter" });
});

export default router;
