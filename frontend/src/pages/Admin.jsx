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
  getBlockedPeriods,
  createBlockedPeriod,
  deleteBlockedPeriod,
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
          <button
            className={activeTab === "calendar" ? "active" : ""}
            onClick={() => setActiveTab("calendar")}
          >
            📆 Calendrier
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

              {activeTab === "calendar" && (
                <CalendarView token={token} />
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

// Modal pour gérer les périodes bloquées
function BlockedPeriodsModal({ car, token, onClose }) {
  const [blockedPeriods, setBlockedPeriods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    startDate: "",
    endDate: "",
    reason: "",
  });

  useEffect(() => {
    loadBlockedPeriods();
  }, []);

  async function loadBlockedPeriods() {
    setLoading(true);
    try {
      const response = await getBlockedPeriods(token, car._id);
      setBlockedPeriods(response);
    } catch (err) {
      alert(err.message || "Erreur lors du chargement des blocages");
    } finally {
      setLoading(false);
    }
  }

  async function handleAddBlock(e) {
    e.preventDefault();
    
    if (!formData.startDate || !formData.endDate) {
      alert("Veuillez remplir les dates");
      return;
    }

    try {
      await createBlockedPeriod(token, car._id, formData);
      setFormData({ startDate: "", endDate: "", reason: "" });
      loadBlockedPeriods();
    } catch (err) {
      alert(err.message || "Erreur lors de la création du blocage");
    }
  }

  async function handleDeleteBlock(blockId) {
    if (!window.confirm("Supprimer ce blocage ?")) {
      return;
    }

    try {
      await deleteBlockedPeriod(token, blockId);
      loadBlockedPeriods();
    } catch (err) {
      alert(err.message || "Erreur lors de la suppression");
    }
  }

  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Blocages - {car.brand} {car.model}</h2>
          <button className="btn-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <form onSubmit={handleAddBlock} className="block-form">
            <h3>Ajouter un blocage</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Date début</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, startDate: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label>Date fin</label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, endDate: e.target.value }))}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label>Raison (optionnel)</label>
              <input
                type="text"
                placeholder="Maintenance, révision..."
                value={formData.reason}
                onChange={(e) => setFormData((prev) => ({ ...prev, reason: e.target.value }))}
              />
            </div>
            <button type="submit" className="btn-approve">Ajouter le blocage</button>
          </form>

          <h3 style={{ marginTop: "2rem" }}>Blocages actifs</h3>
          {loading ? (
            <p>Chargement...</p>
          ) : blockedPeriods.length === 0 ? (
            <p className="empty-state">Aucun blocage pour cette voiture</p>
          ) : (
            <ul className="blocks-list">
              {blockedPeriods.map((block) => (
                <li key={block._id} className="block-item">
                  <div className="block-info">
                    <strong>{formatDate(block.startDate)} → {formatDate(block.endDate)}</strong>
                    <br />
                    <small>{block.reason || "Aucune raison spécifiée"}</small>
                  </div>
                  <button
                    className="btn-deactivate"
                    onClick={() => handleDeleteBlock(block._id)}
                  >
                    Supprimer
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function CarsView({ cars = [], onUpdateCar }) {
  const { token } = useAuth();
  const [editingCarId, setEditingCarId] = useState(null);
  const [selectedCarForBlocks, setSelectedCarForBlocks] = useState(null);
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
            <th>Blocages</th>
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
                  <button
                    className="btn-info"
                    onClick={() => setSelectedCarForBlocks(car)}
                    style={{ fontSize: "0.85rem", padding: "0.4rem 0.6rem" }}
                  >
                    Gérer
                  </button>
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

      {selectedCarForBlocks && (
        <BlockedPeriodsModal
          car={selectedCarForBlocks}
          token={token}
          onClose={() => setSelectedCarForBlocks(null)}
        />
      )}
    </div>
  );
}

// Vue calendrier
function CalendarView({ token }) {
  const [cars, setCars] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [blockedPeriods, setBlockedPeriods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    loadCalendarData();
  }, []);

  async function loadCalendarData() {
    setLoading(true);
    try {
      const [carsRes, reservationsRes] = await Promise.all([
        getAllCars(token),
        getAllReservations(token),
      ]);

      setCars(carsRes);
      setReservations(reservationsRes);

      // Charger tous les blocages pour toutes les voitures
      const blocksPromises = carsRes.map((car) =>
        getBlockedPeriods(token, car._id).catch(() => [])
      );
      const allBlocks = await Promise.all(blocksPromises);
      setBlockedPeriods(allBlocks.flat());
    } catch (err) {
      alert(err.message || "Erreur lors du chargement du calendrier");
    } finally {
      setLoading(false);
    }
  }

  function getDaysInMonth(date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
      days.push(new Date(d));
    }

    return days;
  }

  function isDateInRange(date, start, end) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const s = new Date(start);
    s.setHours(0, 0, 0, 0);
    const e = new Date(end);
    e.setHours(0, 0, 0, 0);
    return d >= s && d <= e;
  }

  function getReservationForCarOnDate(carId, date) {
    return reservations.find(
      (r) =>
        r.car?._id === carId &&
        ["PENDING", "CONFIRMED", "ACTIVE"].includes(r.status) &&
        isDateInRange(date, r.startDate, r.endDate)
    );
  }

  function getBlockForCarOnDate(carId, date) {
    return blockedPeriods.find(
      (b) => b.car === carId && isDateInRange(date, b.startDate, b.endDate)
    );
  }

  const days = getDaysInMonth(currentMonth);

  function goToPreviousMonth() {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  }

  function goToNextMonth() {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  }

  function goToToday() {
    setCurrentMonth(new Date());
  }

  if (loading) {
    return <p>Chargement du calendrier...</p>;
  }

  return (
    <div className="calendar-view">
      <div className="calendar-header">
        <h2>
          {currentMonth.toLocaleDateString("fr-FR", {
            month: "long",
            year: "numeric",
          })}
        </h2>
        <div className="calendar-controls">
          <button className="btn-calendar" onClick={goToPreviousMonth}>
            ◀ Mois précédent
          </button>
          <button className="btn-calendar" onClick={goToToday}>
            Aujourd'hui
          </button>
          <button className="btn-calendar" onClick={goToNextMonth}>
            Mois suivant ▶
          </button>
        </div>
      </div>

      <div className="calendar-legend">
        <div className="legend-item">
          <div className="legend-color pending"></div>
          <span>En attente</span>
        </div>
        <div className="legend-item">
          <div className="legend-color confirmed"></div>
          <span>Confirmée</span>
        </div>
        <div className="legend-item">
          <div className="legend-color active"></div>
          <span>Active</span>
        </div>
        <div className="legend-item">
          <div className="legend-color blocked"></div>
          <span>Bloquée</span>
        </div>
      </div>

      <div className="calendar-grid-container">
        <table className="calendar-table">
          <thead>
            <tr>
              <th className="car-column">Voiture</th>
              {days.map((day, i) => (
                <th key={i} className="day-column">
                  <div className="day-header">
                    <div className="day-name">
                      {day.toLocaleDateString("fr-FR", { weekday: "short" })}
                    </div>
                    <div className="day-number">{day.getDate()}</div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cars.map((car) => (
              <tr key={car._id}>
                <td className="car-column">
                  <div className="car-name">
                    <strong>{car.brand} {car.model}</strong>
                    <br />
                    <small>{car.licensePlate}</small>
                  </div>
                </td>
                {days.map((day, i) => {
                  const reservation = getReservationForCarOnDate(car._id, day);
                  const block = getBlockForCarOnDate(car._id, day);

                  let className = "calendar-cell";
                  let title = "";

                  if (block) {
                    className += " blocked";
                    title = `Bloquée: ${block.reason}`;
                  } else if (reservation) {
                    className += ` ${reservation.status.toLowerCase()}`;
                    title = `${reservation.user?.firstName || "Client"} ${reservation.user?.lastName || ""}`;
                  }

                  return (
                    <td key={i} className={className} title={title}>
                      {reservation && (
                        <div className="reservation-marker"></div>
                      )}
                      {block && (
                        <div className="block-marker">🔒</div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
