// src/components/CarCard.jsx
import './CarCard.css';
import { Link } from 'react-router-dom';

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
  return (
    <div className="car-card">
      {/* Header prix + bouton */}
      <div className="car-card-header">
        <div className="car-card-price">
          <span className="car-card-price-label">À partir de *</span>
          <div>
            <span className="car-card-price-value">{pricePerDay}€</span>
            <span className="car-card-price-unit"> / jour</span>
          </div>
        </div>
       <Link to={`/cars/${id}`}>
  <button className="car-card-button">Réserver</button>
</Link>

      </div>

      {/* Image voiture */}
      <div className="car-card-image-wrapper">
       <img className="car-card-image" src={imageUrl} alt={`${brand} ${model}`} />

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
          <span className="car-card-feature-label">Places</span>
          <span className="car-card-feature-value">{seats}</span>
        </div>
        <div className="car-card-feature">
          <div className="car-card-feature-icon">🧳</div>
          <span className="car-card-feature-label">Bagages</span>
          <span className="car-card-feature-value">{luggage}</span>
        </div>
        <div className="car-card-feature">
          <div className="car-card-feature-icon">⚙️</div>
          <span className="car-card-feature-label">Boîte</span>
          <span className="car-card-feature-value">{transmission}</span>
        </div>
        <div className="car-card-feature">
          <div className="car-card-feature-icon">⛽</div>
          <span className="car-card-feature-label">Carburant</span>
          <span className="car-card-feature-value">{fuel}</span>
        </div>
      </div>
    </div>
  );
}

export default CarCard;
