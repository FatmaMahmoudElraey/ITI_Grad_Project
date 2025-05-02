import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

/**
 * Protected route component that only allows access to users with admin role
 * Redirects to login page if user is not authenticated
 * Redirects to home page if user is authenticated but not an admin
 */
const AdminRoute = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated but not admin, redirect to home
  if (user && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  // If admin, render the child routes
  return <Outlet />;
};

export default AdminRoute;
