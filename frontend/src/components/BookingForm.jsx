import { useState } from "react";
import { createReservation } from "../api/reservations";
import { activateAccount } from "../api/auth";
import { useAuth } from "../context/AuthContext";
import "./BookingForm.css";

export default function BookingForm({ car, onClose }) {
  const { login: authLogin } = useAuth();
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

  const [showAccountModal, setShowAccountModal] = useState(false);
  const [accountPassword, setAccountPassword] = useState("");
  const [accountError, setAccountError] = useState("");
  const [reservationSuccess, setReservationSuccess] = useState(null);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // calcul nombre de jours + prix estimé
  let days = null;
  let totalPrice = null;
  let dateError = null;
  let licenseError = null;

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

    // Vérification date d'expiration du permis (pour non connectés)
    if (!isAuthenticated && formData.licenseExpiry && formData.endDate) {
      const licenseExpiryDate = new Date(formData.licenseExpiry);
      const rentalEndDate = new Date(formData.endDate);
      
      if (licenseExpiryDate < rentalEndDate) {
        licenseError = "Votre permis expire avant la fin de la location. Veuillez le renouveler.";
      }
    }

    // Vérification pour utilisateur connecté
    if (isAuthenticated && user.licenseExpiry && formData.endDate) {
      const licenseExpiryDate = new Date(user.licenseExpiry);
      const rentalEndDate = new Date(formData.endDate);
      
      if (licenseExpiryDate < rentalEndDate) {
        licenseError = "Votre permis expire avant la fin de la location. Veuillez mettre à jour votre profil.";
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (dateError) {
      alert(dateError);
      return;
    }

    if (licenseError) {
      alert(licenseError);
      return;
    }

    if (!days) {
      alert("Veuillez choisir des dates valides.");
      return;
    }

    // Validation du numéro de permis pour non connectés
    if (!isAuthenticated && formData.licenseNumber) {
      const licenseNum = formData.licenseNumber.trim();
      if (licenseNum.length < 6 || licenseNum.length > 20) {
        alert("Le numéro de permis doit contenir entre 6 et 20 caractères.");
        return;
      }
    }

    try {
      // Si connecté, utiliser les infos du user, sinon formData
      const userData = isAuthenticated ? {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        licenseNumber: user.licenseNumber,
        licenseExpiry: user.licenseExpiry,
      } : {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        licenseNumber: formData.licenseNumber,
        licenseExpiry: formData.licenseExpiry,
      };

      await createReservation({
        carId: car.id,
        startDate: formData.startDate,
        endDate: formData.endDate,
        startTime: formData.startTime,
        endTime: formData.endTime,
        user: userData,
      });

      // Si déjà connecté, confirmation simple et fermeture
      if (isAuthenticated) {
        alert(`Réservation envoyée ! ${days} jour(s) pour ${totalPrice}€. Vous recevrez une confirmation par email.`);
        onClose();
      } else {
        // Si non connecté, afficher la modale de création de compte
        setReservationSuccess({ days, totalPrice, email: formData.email });
        setShowAccountModal(true);
      }
    } catch (error) {
      alert(error.message || "Erreur lors de la réservation.");
    }
  };

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    setAccountError("");

    if (accountPassword.length < 6) {
      setAccountError("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    try {
      const response = await activateAccount(reservationSuccess.email, accountPassword);
      authLogin(response.data.user, response.data.token);
      alert(`Compte créé ! Réservation confirmée pour ${reservationSuccess.days} jour(s).`);
      onClose();
    } catch (error) {
      setAccountError(error.message || "Erreur lors de la création du compte.");
    }
  };

  const handleSkipAccount = () => {
    alert(
      `Demande envoyée pour ${reservationSuccess.days} jour(s), prix estimé : ${reservationSuccess.totalPrice}€. Vous recevrez un email de confirmation.`
    );
    onClose();
  };

  return (
    <div className="booking-form-container">
      {!showAccountModal ? (
        <>
          <h3>
            Demande de réservation pour {car.brand} {car.model}
          </h3>

          {isAuthenticated && (
            <p className="booking-user-info">
              Réservation pour : <strong>{user.firstName} {user.lastName}</strong> ({user.email})
            </p>
          )}

          <form className="booking-form" onSubmit={handleSubmit}>
            <div className="booking-form-grid">
              {/* Afficher les champs d'identité seulement si NON connecté */}
              {!isAuthenticated && (
                <>
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
                      placeholder="6 à 20 caractères"
                      minLength={6}
                      maxLength={20}
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
                </>
              )}

              {/* Champs de dates toujours visibles */}
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
        {licenseError && <p className="booking-error">{licenseError}</p>}

        {days && !dateError && !licenseError && (
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
        </>
      ) : (
        <div className="account-modal">
          <h3>✅ Réservation envoyée !</h3>
          <p>
            Votre demande pour {reservationSuccess.days} jour(s) a été envoyée
            (prix estimé : {reservationSuccess.totalPrice}€).
          </p>
          <p className="modal-question">
            Créer un compte pour suivre votre réservation ?
          </p>

          <form onSubmit={handleCreateAccount} className="account-form">
            <div className="booking-form-group">
              <label>Mot de passe (min. 6 caractères)</label>
              <input
                type="password"
                value={accountPassword}
                onChange={(e) => setAccountPassword(e.target.value)}
                placeholder="Choisissez un mot de passe"
                autoFocus
              />
            </div>

            {accountError && <p className="booking-error">{accountError}</p>}

            <div className="booking-form-actions">
              <button type="submit" className="booking-submit">
                Créer mon compte
              </button>
              <button
                type="button"
                className="booking-cancel"
                onClick={handleSkipAccount}
              >
                Continuer sans compte
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
