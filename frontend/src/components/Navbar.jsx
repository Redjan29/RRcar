// src/components/Navbar.jsx
import { Link } from "react-router-dom";
import logo from "../assets/RRCAR.jpeg";
import "./Navbar.css";
import { useAppContext } from "../context/AppContext.jsx";

export default function Navbar() {
  const { currency, setCurrency, language, setLanguage } = useAppContext();

  return (
    <header className="navbar">
      {/* Logo */}
      <div className="navbar-left">
        <Link to="/" className="navbar-logo-link">
          <img src={logo} alt="R&R Cars" className="navbar-logo-img" />
        </Link>
      </div>

      {/* Droite : langue, monnaie, connexion, inscription */}
      <div className="navbar-right">
        {/* Langue */}
        <select
          className="navbar-select"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          <option value="fr">FR</option>
          <option value="en">EN</option>
        </select>

        {/* Monnaie */}
        <select
          className="navbar-select"
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
        >
          <option value="EUR">€ EUR</option>
          <option value="USD">$ USD</option>
        </select>

        {/* Connexion / Inscription */}
        <Link to="/login" className="navbar-link">
          {language === "fr" ? "Connexion" : "Log in"}
        </Link>
        <Link to="/signup" className="navbar-button">
          {language === "fr" ? "Inscription" : "Sign up"}
        </Link>
      </div>
    </header>
  );
}
