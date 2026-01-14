// src/pages/Signup.jsx
import Navbar from "../components/Navbar.jsx";
import { useAppContext } from "../context/AppContext.jsx";
import "./Auth.css";

export default function Signup() {
  const { language } = useAppContext();

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    const firstName = data.get("firstName");
    const lastName = data.get("lastName");
    const email = data.get("email");
    const password = data.get("password");

    console.log("Signup attempt:", { firstName, lastName, email, password });
    alert(
      language === "fr"
        ? "Inscription simulée (backend à brancher plus tard)."
        : "Signup simulated (backend to be wired later)."
    );
  };

  return (
    <>
      <Navbar />
      <div className="auth-page">
        <div className="auth-card">
          <h1>{language === "fr" ? "Inscription" : "Sign up"}</h1>
          <form onSubmit={handleSubmit} className="auth-form">
            <label>
              {language === "fr" ? "Prénom" : "First name"}
              <input type="text" name="firstName" required />
            </label>
            <label>
              {language === "fr" ? "Nom" : "Last name"}
              <input type="text" name="lastName" required />
            </label>
            <label>
              Email
              <input type="email" name="email" required />
            </label>
            <label>
              {language === "fr" ? "Mot de passe" : "Password"}
              <input type="password" name="password" required />
            </label>
            <button type="submit" className="auth-button">
              {language === "fr" ? "Créer un compte" : "Create account"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
