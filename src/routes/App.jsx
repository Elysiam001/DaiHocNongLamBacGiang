import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../screens/LoginPage.jsx";
import RegisterPage from "../screens/RegisterPage.jsx";
import LobbyPage from "../screens/LobbyPage.jsx";
import { getSession } from "../services/authStorage.js";

function RequireAuth({ children }) {
  const session = getSession();
  if (!session) {
    return <Navigate to="/" replace />;
  }
  return children;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/lobby"
        element={
          <RequireAuth>
            <LobbyPage />
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
