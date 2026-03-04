import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import {
  getDashboardStats,
  getAllReservations,
  getAllUsers,
  getAllCars,
  updateReservationStatus,
  updateCar,
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
  const [cars, setCars] = useState([]);
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
        setStats(response);
      } else if (activeTab === "reservations") {
        const response = await getAllReservations(token);
        setReservations(response);
      } else if (activeTab === "users") {
        const response = await getAllUsers(token);
        setUsers(response);
      } else if (activeTab === "cars") {
        const response = await getAllCars(token);
        setCars(response);
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

  async function handleUpdateCar(carId, updates) {
    try {
      await updateCar(token, carId, updates);
      loadData();
    } catch (err) {
      alert(err.message || "Erreur lors de la mise à jour de la voiture");
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
          <button
            className={activeTab === "cars" ? "active" : ""}
            onClick={() => setActiveTab("cars")}
          >
            🚗 Voitures
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

              {activeTab === "cars" && (
                <CarsView cars={cars} onUpdateCar={handleUpdateCar} />
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
  if (!stats || !stats.reservations) {
    return <div className="empty-state"><p>Chargement des statistiques...</p></div>;
  }
  
  const byStatus = Array.isArray(stats.reservations.byStatus)
    ? stats.reservations.byStatus
    : [];
  const recentReservations = Array.isArray(stats.recent) ? stats.recent : [];
  const pending = byStatus.find((s) => s?._id === "PENDING");
  const confirmed = byStatus.find((s) => s?._id === "CONFIRMED");

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
            {recentReservations.map((res) => (
              <tr key={res._id}>
                <td>
                  {res.user
                    ? `${res.user.firstName || ""} ${res.user.lastName || ""}`.trim() || "Client inconnu"
                    : "Client supprimé"}
                </td>
                <td>
                  {res.car
                    ? `${res.car.brand || ""} ${res.car.model || ""}`.trim() || "Voiture inconnue"
                    : "Voiture supprimée"}
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
function ReservationsView({ reservations = [], onUpdateStatus }) {
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

      {filteredReservations.length === 0 ? (
        <div className="empty-state">
          <p>📋 Aucune réservation trouvée</p>
        </div>
      ) : (
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
                {res.user
                  ? `${res.user.firstName || ""} ${res.user.lastName || ""}`.trim() || "Client inconnu"
                  : "Client supprimé"}
              </td>
              <td>{res.user?.email || "-"}</td>
              <td>{res.user?.phone || "-"}</td>
              <td>
                {res.car
                  ? `${res.car.brand || ""} ${res.car.model || ""}`.trim() || "Voiture inconnue"
                  : "Voiture supprimée"}
                <br />
                <small>{res.car?.licensePlate || "-"}</small>
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
      )}
    </div>
  );
}

// Liste des utilisateurs
function UsersView({ users = [], onToggleActive }) {
  return (
    <div className="users-view">
      {users.length === 0 ? (
        <div className="empty-state">
          <p>👥 Aucun utilisateur trouvé</p>
        </div>
      ) : (
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
      )}
    </div>
  );
}

function CarsView({ cars = [], onUpdateCar }) {
  const [editingCarId, setEditingCarId] = useState(null);
  const [formData, setFormData] = useState({
    pricePerDay: "",
    description: "",
    status: "DISPONIBLE",
    seats: "",
    luggage: "",
    transmission: "Manuel",
    fuel: "Essence",
    imageUrl: "",
  });

  const handleStartEdit = (car) => {
    setEditingCarId(car._id);
    setFormData({
      pricePerDay: String(car.pricePerDay ?? ""),
      description: car.description ?? "",
      status: car.status ?? "DISPONIBLE",
      seats: String(car.seats ?? ""),
      luggage: String(car.luggage ?? ""),
      transmission: car.transmission ?? "Manuel",
      fuel: car.fuel ?? "Essence",
      imageUrl: car.imageUrl ?? "",
    });
  };

  const handleCancelEdit = () => {
    setEditingCarId(null);
  };

  const handleSave = async () => {
    if (!editingCarId) {
      return;
    }

    await onUpdateCar(editingCarId, {
      pricePerDay: Number(formData.pricePerDay),
      description: formData.description,
      status: formData.status,
      seats: Number(formData.seats),
      luggage: Number(formData.luggage),
      transmission: formData.transmission,
      fuel: formData.fuel,
      imageUrl: formData.imageUrl,
    });

    setEditingCarId(null);
  };

  if (cars.length === 0) {
    return (
      <div className="empty-state">
        <p>🚗 Aucune voiture trouvée</p>
      </div>
    );
  }

  return (
    <div className="cars-view">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Voiture</th>
            <th>Plaque</th>
            <th>Prix/jour</th>
            <th>Statut</th>
            <th>Description</th>
            <th>Specs</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {cars.map((car) => {
            const isEditing = editingCarId === car._id;

            return (
              <tr key={car._id}>
                <td>
                  <strong>{car.brand} {car.model}</strong>
                  <br />
                  <small>{car.category}</small>
                </td>
                <td>{car.licensePlate}</td>
                <td>
                  {isEditing ? (
                    <input
                      className="admin-input"
                      type="number"
                      min="1"
                      value={formData.pricePerDay}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, pricePerDay: e.target.value }))
                      }
                    />
                  ) : (
                    `${car.pricePerDay}€`
                  )}
                </td>
                <td>
                  {isEditing ? (
                    <select
                      className="admin-select"
                      value={formData.status}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, status: e.target.value }))
                      }
                    >
                      <option value="DISPONIBLE">DISPONIBLE</option>
                      <option value="RESERVATION">RESERVATION</option>
                      <option value="MAINTENANCE">MAINTENANCE</option>
                      <option value="INDISPONIBLE">INDISPONIBLE</option>
                    </select>
                  ) : (
                    <span className={`status-badge ${String(car.status).toLowerCase()}`}>
                      {car.status}
                    </span>
                  )}
                </td>
                <td>
                  {isEditing ? (
                    <textarea
                      className="admin-textarea"
                      rows={3}
                      value={formData.description}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, description: e.target.value }))
                      }
                    />
                  ) : (
                    <span>{car.description || "-"}</span>
                  )}
                </td>
                <td>
                  {isEditing ? (
                    <div className="car-edit-grid">
                      <input
                        className="admin-input"
                        type="number"
                        min="1"
                        placeholder="Places"
                        value={formData.seats}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, seats: e.target.value }))
                        }
                      />
                      <input
                        className="admin-input"
                        type="number"
                        min="0"
                        placeholder="Bagages"
                        value={formData.luggage}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, luggage: e.target.value }))
                        }
                      />
                      <select
                        className="admin-select"
                        value={formData.transmission}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, transmission: e.target.value }))
                        }
                      >
                        <option value="Manuel">Manuel</option>
                        <option value="Auto">Auto</option>
                      </select>
                      <select
                        className="admin-select"
                        value={formData.fuel}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, fuel: e.target.value }))
                        }
                      >
                        <option value="Essence">Essence</option>
                        <option value="Diesel">Diesel</option>
                        <option value="Électrique">Électrique</option>
                        <option value="Hybride">Hybride</option>
                      </select>
                      <input
                        className="admin-input"
                        type="text"
                        placeholder="Image URL"
                        value={formData.imageUrl}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, imageUrl: e.target.value }))
                        }
                      />
                    </div>
                  ) : (
                    <>
                      <small>{car.seats} places · {car.luggage} bagages</small>
                      <br />
                      <small>{car.transmission} · {car.fuel}</small>
                    </>
                  )}
                </td>
                <td className="actions-cell">
                  {isEditing ? (
                    <>
                      <button className="btn-approve" onClick={handleSave}>
                        Sauvegarder
                      </button>
                      <button className="btn-deactivate" onClick={handleCancelEdit}>
                        Annuler
                      </button>
                    </>
                  ) : (
                    <button className="btn-active" onClick={() => handleStartEdit(car)}>
                      Modifier
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
