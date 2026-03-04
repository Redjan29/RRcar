import { apiFetch } from "./client";

// Récupérer les stats du dashboard
export function getDashboardStats(token) {
  return apiFetch("/api/admin/stats", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

// Lister toutes les réservations
export function getAllReservations(token, filters = {}) {
  const params = new URLSearchParams(filters);
  return apiFetch(`/api/admin/reservations?${params}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

// Mettre à jour le statut d'une réservation
export function updateReservationStatus(token, reservationId, status, notes) {
  return apiFetch(`/api/admin/reservations/${reservationId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status, notes }),
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

// Lister tous les utilisateurs
export function getAllUsers(token, filters = {}) {
  const params = new URLSearchParams(filters);
  return apiFetch(`/api/admin/users?${params}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

// Mettre à jour un utilisateur
export function updateUser(token, userId, updates) {
  return apiFetch(`/api/admin/users/${userId}`, {
    method: "PATCH",
    body: JSON.stringify(updates),
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

// Lister toutes les voitures (admin)
export function getAllCars(token) {
  return apiFetch("/api/admin/cars", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

// Mettre à jour une voiture (admin)
export function updateCar(token, carId, updates) {
  return apiFetch(`/api/admin/cars/${carId}`, {
    method: "PATCH",
    body: JSON.stringify(updates),
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

// Récupérer les périodes bloquées d'une voiture
export function getBlockedPeriods(token, carId) {
  return apiFetch(`/api/admin/cars/${carId}/blocks`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

// Créer une période bloquée
export function createBlockedPeriod(token, carId, data) {
  return apiFetch(`/api/admin/cars/${carId}/blocks`, {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

// Supprimer une période bloquée
export function deleteBlockedPeriod(token, blockId) {
  return apiFetch(`/api/admin/blocks/${blockId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
