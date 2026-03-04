// src/context/AppContext.jsx
import { createContext, useContext, useState } from "react";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [currency, setCurrency] = useState("EUR"); // "EUR" | "USD"
  const [language, setLanguage] = useState("fr");  // "fr" | "en"

  // taux simples pour l'instant (mock)
  const rates = {
    EUR: 1,
    USD: 1.1, // exemple : 1€ ≈ 1.1$
  };

  const currencySymbols = {
    EUR: "€",
    USD: "$",
  };

  function convertPrice(eurPrice) {
    const rate = rates[currency] ?? 1;
    const raw = eurPrice * rate;
    // On arrondit à l'unité pour rester simple
    return Math.round(raw);
  }

  function formatPrice(eurPrice) {
    const amount = convertPrice(eurPrice);
    const symbol = currencySymbols[currency] ?? "€";
    return `${amount}${symbol}`;
  }

  const value = {
    currency,
    setCurrency,
    language,
    setLanguage,
    convertPrice,
    formatPrice,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error("useAppContext must be used inside AppProvider");
  }
  return ctx;
}
