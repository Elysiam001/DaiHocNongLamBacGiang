import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getSession } from "../services/authStorage.js";

export default function RequireAuth({ children }) {
  const location = useLocation();
  const session = getSession();

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}

