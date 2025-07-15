
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { rolePages } from './RolePages';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireDoctor?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAdmin = false,
  requireDoctor = false,
}) => {
  const { isAuthenticated, isAdmin, user } = useAuth();
    // Check if the user is authenticated
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }
  if (requireDoctor && user?.roleId !== 2) {
    return <Navigate to="/dashboard" replace />;
  }
  

  return <>{children}</>;
};

export default ProtectedRoute;

/*
// src/components/ProtectedRoutes.tsx
import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { rolePages } from "./RolePages";

const ProtectedRoutes: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Get all allowed paths for this user
  const allowedPaths = (rolePages[user.roleName as keyof typeof rolePages] || []).map((p: { path: string }) => p.path);

  // If the current path is not allowed, redirect to a default page
  if (!allowedPaths.includes(location.pathname)) {
    return <Navigate to={allowedPaths[0] || "/"} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoutes;
*/