import { apiFetch } from "./client";

export function createReservation(payload) {
  return apiFetch("/api/reservations", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}