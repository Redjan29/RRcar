import { useState, useRef, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getCarById } from "../data/cars";
import BookingForm from "../components/BookingForm";
import "./CarDetails.css";

export default function CarDetails() {
  const { id } = useParams();
  const car = getCarById(id);

  const [showForm, setShowForm] = useState(false);
  const formRef = useRef(null);

  useEffect(() => {
    if (showForm && formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [showForm]);

  if (!car) {
    return (
      <div style={{ padding: 20 }}>
        <h2>Voiture introuvable.</h2>
        <Link to="/">← Retour aux véhicules</Link>
      </div>
    );
  }

  return (
    <div className="car-details-page">
      <div className="car-details-container">
        {/* LEFT */}
        <div className="car-details-left">
          <img
            src={car.imageUrl}
            alt={car.brand}
            className="car-details-main-image"
          />

          <div className="car-details-thumbs">
            <img
              src={car.imageUrl}
              alt="thumb"
              className="car-details-thumb active"
            />
          </div>
        </div>

        {/* RIGHT */}
        <div className="car-details-right">
          <span className="car-details-category">{car.category}</span>

          <h1 className="car-details-title">
            {car.brand} {car.model}
          </h1>

          <p className="car-details-subtitle">Ou similaire</p>

          <p className="car-details-description">{car.description}</p>

          <div className="car-details-specs">
            <div className="car-spec-box">👥 {car.seats} places</div>
            <div className="car-spec-box">🧳 {car.luggage} bagages</div>
            <div className="car-spec-box">⚙️ {car.transmission}</div>
            <div className="car-spec-box">⛽ {car.fuel}</div>
          </div>

          <div className="car-details-requirements">
            <h3>Conditions du véhicule</h3>
            <div className="car-requirement-item">🚗 Âge minimum : 25 ans</div>
            <div className="car-requirement-item">🪪 Permis valide</div>
          </div>

          <div className="car-details-price">
            À partir de {car.pricePerDay}€ <span>/ jour</span>
          </div>

          <button
            className="car-details-button"
            onClick={() => setShowForm(true)}
          >
            Réserver
          </button>
        </div>
      </div>

      {showForm && (
        <div ref={formRef} className="booking-form-wrapper">
          <BookingForm car={car} onClose={() => setShowForm(false)} />
        </div>
      )}
    </div>
  );
}
