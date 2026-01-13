// src/components/Navbar.jsx
import { Link } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
  return (
    <header className="navbar">
      {/* Logo */}
      <div className="navbar-left">
        <Link to="/" className="navbar-logo">
          R&R Cars
        </Link>
      </div>

      {/* Droite : langue, monnaie, connexion, inscription */}
      <div className="navbar-right">
        {/* Langue */}
        <select className="navbar-select">
          <option value="fr">FR</option>
          <option value="en">EN</option>
        </select>

        {/* Monnaie */}
        <select className="navbar-select">
          <option value="eur">€ EUR</option>
          <option value="usd">$ USD</option>
        </select>

        {/* Connexion / Inscription */}
        <Link to="/login" className="navbar-link">
          Connexion
        </Link>
        <Link to="/signup" className="navbar-button">
          Inscription
        </Link>
      </div>
    </header>
  );
}
