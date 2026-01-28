import express from "express";

const router = express.Router();

// Routes des réservations - placeholder pour l'instant
router.post("/", (req, res) => {
  res.json({ message: "POST /reservations - Créer une réservation - à implémenter" });
});

router.get("/:id", (req, res) => {
  res.json({ message: "GET /reservations/:id - Détails d'une réservation - à implémenter" });
});

router.put("/:id", (req, res) => {
  res.json({ message: "PUT /reservations/:id - Modifier une réservation - à implémenter" });
});

router.delete("/:id", (req, res) => {
  res.json({ message: "DELETE /reservations/:id - Annuler une réservation - à implémenter" });
});

export default router;
