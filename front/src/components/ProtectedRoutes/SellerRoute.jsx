import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

/**
 * Protected route component that only allows access to users with seller role
 * Redirects to login page if user is not authenticated
 * Redirects to home page if user is authenticated but not a seller
 */
const SellerRoute = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated but not seller, redirect to home
  if (user && user.role !== 'seller') {
    return <Navigate to="/" replace />;
  }

  // If seller, render the child routes
  return <Outlet />;
};

export default SellerRoute;
