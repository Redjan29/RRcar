// src/pages/CarDetails.jsx
import { useState, useRef, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getCarById } from "../data/cars";
import BookingForm from "../components/BookingForm";
import Navbar from "../components/Navbar";
import { useAppContext } from "../context/AppContext.jsx";
import "./CarDetails.css";

export default function CarDetails() {
  const { id } = useParams();
  const car = getCarById(id);

  const { formatPrice, language } = useAppContext();

  const [showForm, setShowForm] = useState(false);
  const formRef = useRef(null);

  useEffect(() => {
    if (showForm && formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [showForm]);

  if (!car) {
    return (
      <>
        <Navbar />
        <div style={{ padding: 20 }}>
          <h2>
            {language === "fr" ? "Voiture introuvable." : "Car not found."}
          </h2>
          <Link to="/">
            {language === "fr"
              ? "← Retour aux véhicules"
              : "← Back to vehicles"}
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
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

            <p className="car-details-subtitle">
              {language === "fr" ? "Ou similaire" : "Or similar"}
            </p>

            <p className="car-details-description">{car.description}</p>

            <div className="car-details-specs">
              <div className="car-spec-box">
                👥 {car.seats}{" "}
                {language === "fr" ? "places" : "seats"}
              </div>
              <div className="car-spec-box">
                🧳 {car.luggage}{" "}
                {language === "fr" ? "bagages" : "luggage"}
              </div>
              <div className="car-spec-box">
                ⚙️ {car.transmission}
              </div>
              <div className="car-spec-box">
                ⛽ {car.fuel}
              </div>
            </div>

            <div className="car-details-requirements">
              <h3>
                {language === "fr"
                  ? "Conditions du véhicule"
                  : "Vehicle requirements"}
              </h3>
              <div className="car-requirement-item">
                🚗{" "}
                {language === "fr"
                  ? "Âge minimum : 25 ans"
                  : "Minimum age: 25 years"}
              </div>
              <div className="car-requirement-item">
                🪪{" "}
                {language === "fr"
                  ? "Permis valide"
                  : "Valid driving license"}
              </div>
            </div>

            <div className="car-details-price">
              {language === "fr" ? "À partir de " : "From "}
              {formatPrice(car.pricePerDay)}{" "}
              <span>{language === "fr" ? "/ jour" : "/ day"}</span>
            </div>

            <button
              className="car-details-button"
              onClick={() => setShowForm(true)}
            >
              {language === "fr" ? "Réserver" : "Book now"}
            </button>
          </div>
        </div>

        {showForm && (
          <div ref={formRef} className="booking-form-wrapper">
            <BookingForm car={car} onClose={() => setShowForm(false)} />
          </div>
        )}
      </div>
    </>
  );
}
