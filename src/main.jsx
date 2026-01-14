import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App.jsx';
import CarDetails from './pages/CarDetails.jsx';
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import { AppProvider } from "./context/AppContext.jsx";

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppProvider>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/cars" element={<App />} />
          <Route path="/cars/:id" element={<CarDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </AppProvider>
    </BrowserRouter>
  </React.StrictMode>
);
