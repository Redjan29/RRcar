// src/pages/Signup.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import { useAppContext } from "../context/AppContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import "./Auth.css";

export default function Signup() {
  const { language } = useAppContext();
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    licenseNumber: "",
    licenseExpiry: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validation basique
    if (formData.password.length < 6) {
      setError(
        language === "fr"
          ? "Le mot de passe doit contenir au moins 6 caractères"
          : "Password must be at least 6 characters"
      );
      setLoading(false);
      return;
    }

    // Validation du numéro de permis
    const licenseNum = formData.licenseNumber.trim();
    if (licenseNum.length < 6 || licenseNum.length > 20) {
      setError(
        language === "fr"
          ? "Le numéro de permis doit contenir entre 6 et 20 caractères"
          : "License number must be between 6 and 20 characters"
      );
      setLoading(false);
      return;
    }

    // Validation de la date d'expiration du permis
    const licenseExpiryDate = new Date(formData.licenseExpiry);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (licenseExpiryDate < today) {
      setError(
        language === "fr"
          ? "Votre permis de conduire est expiré"
          : "Your driver's license is expired"
      );
      setLoading(false);
      return;
    }

    try {
      await register(formData);
      navigate("/");
    } catch (err) {
      setError(
        err.message ||
          (language === "fr"
            ? "Erreur lors de la création du compte"
            : "Error creating account")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="auth-page">
        <div className="auth-card">
          <h1>{language === "fr" ? "Inscription" : "Sign up"}</h1>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <label>
              {language === "fr" ? "Prénom" : "First name"}
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </label>
            <label>
              {language === "fr" ? "Nom" : "Last name"}
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </label>
            <label>
              Email
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </label>
            <label>
              {language === "fr" ? "Téléphone" : "Phone"}
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </label>
            <label>
              {language === "fr" ? "Numéro de permis" : "License number"}
              <input
                type="text"
                name="licenseNumber"
                value={formData.licenseNumber}
                onChange={handleChange}
                placeholder={language === "fr" ? "6 à 20 caractères" : "6 to 20 characters"}
                minLength={6}
                maxLength={20}
                required
                disabled={loading}
              />
            </label>
            <label>
              {language === "fr"
                ? "Date d'expiration du permis"
                : "License expiry date"}
              <input
                type="date"
                name="licenseExpiry"
                value={formData.licenseExpiry}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                required
                disabled={loading}
              />
            </label>
            <label>
              {language === "fr" ? "Mot de passe" : "Password"}
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={loading}
                minLength={6}
              />
            </label>
            <button type="submit" className="auth-button" disabled={loading}>
              {loading
                ? language === "fr"
                  ? "Création..."
                  : "Creating..."
                : language === "fr"
                ? "Créer un compte"
                : "Create account"}
            </button>
          </form>

          <p className="auth-footer">
            {language === "fr"
              ? "Déjà inscrit ? "
              : "Already have an account? "}
            <Link to="/login">
              {language === "fr" ? "Se connecter" : "Log in"}
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
