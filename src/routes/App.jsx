import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "../screens/LoginPage.jsx";
import RegisterPage from "../screens/RegisterPage.jsx";
import LobbyPage from "../screens/LobbyPage.jsx";
import TaiXiuPage from "../screens/TaiXiuPage.jsx";
import RequireAuth from "./RequireAuth.jsx";
import { getSession } from "../services/authStorage.js";

export default function App() {
  const session = getSession();

  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to={session ? "/lobby" : "/login"} replace />}
      />
      <Route path="/login" element={<LoginPage />} />
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
