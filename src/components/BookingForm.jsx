import { useState } from "react";
import "./BookingForm.css"; // ou commente cette ligne si tu n'as pas encore le css

export default function BookingForm({ car, onClose }) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    startDate: "",
    endDate: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ ...formData, carId: car.id });
    alert("Réservation envoyée (simulation)");
    onClose();
  };

  return (
    <div className="booking-form-container">
      <h3>Demande de réservation pour {car.brand} {car.model}</h3>
      <form className="booking-form" onSubmit={handleSubmit}>
        <input
          name="firstName"
          placeholder="Prénom"
          value={formData.firstName}
          onChange={handleChange}
          required
        />
        <input
          name="lastName"
          placeholder="Nom"
          value={formData.lastName}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="tel"
          name="phone"
          placeholder="Téléphone"
          value={formData.phone}
          onChange={handleChange}
          required
        />
        <input
          type="date"
          name="startDate"
          value={formData.startDate}
          onChange={handleChange}
          required
        />
        <input
          type="date"
          name="endDate"
          value={formData.endDate}
          onChange={handleChange}
          required
        />

        <button type="submit">Envoyer</button>
        <button type="button" onClick={onClose}>
          Annuler
        </button>
      </form>
    </div>
  );
}
