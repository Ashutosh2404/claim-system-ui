import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { isAuthenticated } from "../services/authService";

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const authenticated = isAuthenticated();

  if (!authenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
};

export default ProtectedRoute;
