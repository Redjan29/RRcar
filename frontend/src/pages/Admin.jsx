import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import {
  getDashboardStats,
  getAllReservations,
  getAllUsers,
  updateReservationStatus,
  updateUser,
} from "../api/admin";
import "./Admin.css";

export default function Admin() {
  const { user, token, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState("dashboard");
  const [stats, setStats] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Rediriger si pas admin
  useEffect(() => {
    if (!isAuthenticated || !user?.isAdmin) {
      navigate("/");
    }
  }, [isAuthenticated, user, navigate]);

  // Charger les données initiales
  useEffect(() => {
    if (user?.isAdmin && token) {
      loadData();
    }
  }, [user, token, activeTab]);

  async function loadData() {
    setLoading(true);
    setError("");
    
    try {
      if (activeTab === "dashboard") {
        const response = await getDashboardStats(token);
        setStats(response.data);
      } else if (activeTab === "reservations") {
        const response = await getAllReservations(token);
        setReservations(response.data);
      } else if (activeTab === "users") {
        const response = await getAllUsers(token);
        setUsers(response.data);
      }
    } catch (err) {
      setError(err.message || "Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateReservationStatus(reservationId, newStatus) {
    try {
      await updateReservationStatus(token, reservationId, newStatus);
      loadData(); // Recharger les données
    } catch (err) {
      alert(err.message || "Erreur lors de la mise à jour");
    }
  }

  async function handleToggleUserActive(userId, currentActive) {
    try {
      await updateUser(token, userId, { isActive: !currentActive });
      loadData();
    } catch (err) {
      alert(err.message || "Erreur lors de la mise à jour");
    }
  }

  if (!user?.isAdmin) {
    return null; // ou un loader
  }

  return (
    <>
      <Navbar />
      <div className="admin-page">
        <h1>🔧 Administration</h1>

        {/* Tabs */}
        <div className="admin-tabs">
          <button
            className={activeTab === "dashboard" ? "active" : ""}
            onClick={() => setActiveTab("dashboard")}
          >
            📊 Dashboard
          </button>
          <button
            className={activeTab === "reservations" ? "active" : ""}
            onClick={() => setActiveTab("reservations")}
          >
            📅 Réservations
          </button>
          <button
            className={activeTab === "users" ? "active" : ""}
            onClick={() => setActiveTab("users")}
          >
            👥 Utilisateurs
          </button>
        </div>

        {error && <div className="admin-error">{error}</div>}

        {/* Contenu des tabs */}
        <div className="admin-content">
          {loading ? (
            <p>Chargement...</p>
          ) : (
            <>
              {activeTab === "dashboard" && stats && (
                <DashboardView stats={stats} />
              )}

              {activeTab === "reservations" && (
                <ReservationsView
                  reservations={reservations}
                  onUpdateStatus={handleUpdateReservationStatus}
                />
              )}

              {activeTab === "users" && (
                <UsersView
                  users={users}
                  onToggleActive={handleToggleUserActive}
                />
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

// Dashboard Stats
function DashboardView({ stats }) {
  const pending = stats.reservations.byStatus.find((s) => s._id === "PENDING");
  const confirmed = stats.reservations.byStatus.find((s) => s._id === "CONFIRMED");

  return (
    <div className="dashboard-view">
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Réservations en attente</h3>
          <p className="stat-number">{pending?.count || 0}</p>
        </div>
        
        <div className="stat-card">
          <h3>Réservations confirmées</h3>
          <p className="stat-number">{confirmed?.count || 0}</p>
        </div>

        <div className="stat-card">
          <h3>Départs aujourd'hui</h3>
          <p className="stat-number">{stats.reservations.todayPickups}</p>
        </div>

        <div className="stat-card">
          <h3>Retours aujourd'hui</h3>
          <p className="stat-number">{stats.reservations.todayReturns}</p>
        </div>

        <div className="stat-card">
          <h3>Total utilisateurs</h3>
          <p className="stat-number">{stats.users.total}</p>
          <p className="stat-detail">
            {stats.users.active} avec compte, {stats.users.guests} invités
          </p>
        </div>

        <div className="stat-card">
          <h3>Voitures</h3>
          <p className="stat-number">{stats.cars.total}</p>
          <p className="stat-detail">{stats.cars.available} disponibles</p>
        </div>
      </div>

      <div className="recent-reservations">
        <h2>Dernières réservations</h2>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Client</th>
              <th>Voiture</th>
              <th>Dates</th>
              <th>Statut</th>
              <th>Prix</th>
            </tr>
          </thead>
          <tbody>
            {stats.recent.map((res) => (
              <tr key={res._id}>
                <td>
                  {res.user.firstName} {res.user.lastName}
                </td>
                <td>
                  {res.car.brand} {res.car.model}
                </td>
                <td>
                  {new Date(res.startDate).toLocaleDateString()} →{" "}
                  {new Date(res.endDate).toLocaleDateString()}
                </td>
                <td>
                  <span className={`status-badge ${res.status.toLowerCase()}`}>
                    {res.status}
                  </span>
                </td>
                <td>{res.totalPrice}€</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Liste des réservations
function ReservationsView({ reservations, onUpdateStatus }) {
  const [filterStatus, setFilterStatus] = useState("");

  const filteredReservations = filterStatus
    ? reservations.filter((r) => r.status === filterStatus)
    : reservations;

  return (
    <div className="reservations-view">
      <div className="filter-bar">
        <label>
          Filtrer par statut:
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="">Tous</option>
            <option value="PENDING">En attente</option>
            <option value="CONFIRMED">Confirmé</option>
            <option value="ACTIVE">En cours</option>
            <option value="COMPLETED">Terminé</option>
            <option value="CANCELLED">Annulé</option>
          </select>
        </label>
      </div>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Client</th>
            <th>Email</th>
            <th>Téléphone</th>
            <th>Voiture</th>
            <th>Dates</th>
            <th>Statut</th>
            <th>Prix</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredReservations.map((res) => (
            <tr key={res._id}>
              <td>
                {res.user.firstName} {res.user.lastName}
              </td>
              <td>{res.user.email}</td>
              <td>{res.user.phone}</td>
              <td>
                {res.car.brand} {res.car.model}
                <br />
                <small>{res.car.licensePlate}</small>
              </td>
              <td>
                {new Date(res.startDate).toLocaleDateString()}
                <br />→ {new Date(res.endDate).toLocaleDateString()}
              </td>
              <td>
                <span className={`status-badge ${res.status.toLowerCase()}`}>
                  {res.status}
                </span>
              </td>
              <td>{res.totalPrice}€</td>
              <td className="actions-cell">
                {res.status === "PENDING" && (
                  <>
                    <button
                      className="btn-approve"
                      onClick={() => onUpdateStatus(res._id, "CONFIRMED")}
                    >
                      ✓ Approuver
                    </button>
                    <button
                      className="btn-reject"
                      onClick={() => onUpdateStatus(res._id, "CANCELLED")}
                    >
                      ✗ Refuser
                    </button>
                  </>
                )}
                {res.status === "CONFIRMED" && (
                  <button
                    className="btn-active"
                    onClick={() => onUpdateStatus(res._id, "ACTIVE")}
                  >
                    🚗 Démarrer
                  </button>
                )}
                {res.status === "ACTIVE" && (
                  <button
                    className="btn-complete"
                    onClick={() => onUpdateStatus(res._id, "COMPLETED")}
                  >
                    ✓ Terminer
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Liste des utilisateurs
function UsersView({ users, onToggleActive }) {
  return (
    <div className="users-view">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Nom</th>
            <th>Email</th>
            <th>Téléphone</th>
            <th>Permis</th>
            <th>Type compte</th>
            <th>Réservations</th>
            <th>Statut</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u._id}>
              <td>
                {u.firstName} {u.lastName}
              </td>
              <td>{u.email}</td>
              <td>{u.phone}</td>
              <td>
                {u.licenseNumber}
                <br />
                <small>
                  Exp: {new Date(u.licenseExpiry).toLocaleDateString()}
                </small>
              </td>
              <td>
                {u.hasPassword ? (
                  <span className="badge-account">Compte complet</span>
                ) : (
                  <span className="badge-guest">Invité</span>
                )}
              </td>
              <td>{u.reservations?.length || 0}</td>
              <td>
                {u.isActive ? (
                  <span className="badge-active">Actif</span>
                ) : (
                  <span className="badge-inactive">Inactif</span>
                )}
              </td>
              <td>
                <button
                  className={u.isActive ? "btn-deactivate" : "btn-activate"}
                  onClick={() => onToggleActive(u._id, u.isActive)}
                >
                  {u.isActive ? "Désactiver" : "Activer"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
