// src/pages/Login.jsx
import Navbar from "../components/Navbar.jsx";
import { useAppContext } from "../context/AppContext.jsx";
import "./Auth.css";

export default function Login() {
  const { language } = useAppContext();

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    const email = data.get("email");
    const password = data.get("password");

    console.log("Login attempt:", { email, password });
    alert(
      language === "fr"
        ? "Connexion simulée (backend à brancher plus tard)."
        : "Login simulated (backend to be wired later)."
    );
  };

  return (
    <>
      <Navbar />
      <div className="auth-page">
        <div className="auth-card">
          <h1>{language === "fr" ? "Connexion" : "Log in"}</h1>
          <form onSubmit={handleSubmit} className="auth-form">
            <label>
              Email
              <input type="email" name="email" required />
            </label>
            <label>
              {language === "fr" ? "Mot de passe" : "Password"}
              <input type="password" name="password" required />
            </label>
            <button type="submit" className="auth-button">
              {language === "fr" ? "Se connecter" : "Log in"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
