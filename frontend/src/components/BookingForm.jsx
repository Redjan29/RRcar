import { useState } from "react";
import { createReservation } from "../api/reservations";
import "./BookingForm.css";

export default function BookingForm({ car, onClose }) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    licenseNumber: "",
    licenseExpiry: "",
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // calcul nombre de jours + prix estimé
  let days = null;
  let totalPrice = null;
  let dateError = null;

  if (formData.startDate && formData.endDate) {
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const diffMs = end - start;

    if (diffMs < 0) {
      dateError = "La date de fin doit être après la date de début.";
    } else {
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1; // min 1 jour
      days = diffDays;
      totalPrice = diffDays * car.pricePerDay;
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (dateError) {
      alert(dateError);
      return;
    }

    if (!days) {
      alert("Veuillez choisir des dates valides.");
      return;
    }

    try {
      await createReservation({
        carId: car.id,
        startDate: formData.startDate,
        endDate: formData.endDate,
        startTime: formData.startTime,
        endTime: formData.endTime,
        user: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          licenseNumber: formData.licenseNumber,
          licenseExpiry: formData.licenseExpiry,
        },
      });

      alert(
        `Demande envoyée pour ${days} jour(s), prix estimé : ${totalPrice}€.`
      );

      onClose();
    } catch (error) {
      alert(error.message || "Erreur lors de la réservation.");
    }
  };

  return (
    <div className="booking-form-container">
      <h3>
        Demande de réservation pour {car.brand} {car.model}
      </h3>

      <form className="booking-form" onSubmit={handleSubmit}>
        <div className="booking-form-grid">
          <div className="booking-form-group">
            <label>Prénom</label>
            <input
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="booking-form-group">
            <label>Nom</label>
            <input
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="booking-form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="booking-form-group">
            <label>Téléphone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>

          <div className="booking-form-group">
            <label>Numéro de permis</label>
            <input
              name="licenseNumber"
              value={formData.licenseNumber}
              onChange={handleChange}
              required
            />
          </div>

          <div className="booking-form-group">
            <label>Expiration permis</label>
            <input
              type="date"
              name="licenseExpiry"
              value={formData.licenseExpiry}
              onChange={handleChange}
              required
            />
          </div>

          <div className="booking-form-group">
            <label>Date de début</label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="booking-form-group">
            <label>Heure de début</label>
            <input
              type="time"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
            />
          </div>

          <div className="booking-form-group">
            <label>Date de fin</label>
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="booking-form-group">
            <label>Heure de fin</label>
            <input
              type="time"
              name="endTime"
              value={formData.endTime}
              onChange={handleChange}
            />
          </div>
        </div>

        {dateError && <p className="booking-error">{dateError}</p>}

        {days && !dateError && (
          <div className="booking-summary">
            <p>Durée : <strong>{days}</strong> jour(s)</p>
            <p>Prix estimé : <strong>{totalPrice}€</strong></p>
          </div>
        )}

        <div className="booking-form-actions">
          <button type="submit" className="booking-submit">
            Envoyer la demande
          </button>
          <button
            type="button"
            className="booking-cancel"
            onClick={onClose}
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}
