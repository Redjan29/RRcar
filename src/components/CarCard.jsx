// src/components/CarCard.jsx
import "./CarCard.css";
import { Link } from "react-router-dom";
import { useAppContext } from "../context/AppContext.jsx";

function CarCard({
  id,
  brand,
  model,
  category,
  pricePerDay,
  imageUrl,
  seats,
  luggage,
  transmission,
  fuel,
}) {
  const { formatPrice, language } = useAppContext();

  const priceLabel =
    language === "fr" ? "À partir de *" : "Starting from *";
  const perDayLabel =
    language === "fr" ? " / jour" : " / day";

  return (
    <div className="car-card">
      {/* Header prix + bouton */}
      <div className="car-card-header">
        <div className="car-card-price">
          <span className="car-card-price-label">{priceLabel}</span>
          <div>
            <span className="car-card-price-value">
              {formatPrice(pricePerDay)}
            </span>
            <span className="car-card-price-unit">{perDayLabel}</span>
          </div>
        </div>
        <Link to={`/cars/${id}`}>
          <button className="car-card-button">
            {language === "fr" ? "Réserver" : "Book"}
          </button>
        </Link>
      </div>

      {/* Image voiture */}
      <div className="car-card-image-wrapper">
        <img
          className="car-card-image"
          src={imageUrl}
          alt={`${brand} ${model}`}
        />
      </div>

      {/* Infos voiture */}
      <div className="car-card-info">
        <h2 className="car-card-brand">{brand}</h2>
        <p className="car-card-model">{model}</p>
        <p className="car-card-category">{category}</p>
      </div>

      {/* Caractéristiques */}
      <div className="car-card-features">
        <div className="car-card-feature">
          <div className="car-card-feature-icon">👥</div>
          <span className="car-card-feature-label">
            {language === "fr" ? "Places" : "Seats"}
          </span>
          <span className="car-card-feature-value">{seats}</span>
        </div>
        <div className="car-card-feature">
          <div className="car-card-feature-icon">🧳</div>
          <span className="car-card-feature-label">
            {language === "fr" ? "Bagages" : "Luggage"}
          </span>
          <span className="car-card-feature-value">{luggage}</span>
        </div>
        <div className="car-card-feature">
          <div className="car-card-feature-icon">⚙️</div>
          <span className="car-card-feature-label">
            {language === "fr" ? "Boîte" : "Gearbox"}
          </span>
          <span className="car-card-feature-value">{transmission}</span>
        </div>
        <div className="car-card-feature">
          <div className="car-card-feature-icon">⛽</div>
          <span className="car-card-feature-label">
            {language === "fr" ? "Carburant" : "Fuel"}
          </span>
          <span className="car-card-feature-value">{fuel}</span>
        </div>
      </div>
    </div>
  );
}

export default CarCard;
