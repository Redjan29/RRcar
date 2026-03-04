import { apiFetch } from "./client";

export function fetchCars() {
  return apiFetch("/api/cars");
}

export function fetchCarById(id) {
  return apiFetch(`/api/cars/${id}`);
}