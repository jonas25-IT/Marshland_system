import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const RoleBasedRouter = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Role-based routing logic
  const getRouteForRole = () => {
    switch (user?.role) {
      case 'ADMIN':
        return '/admin';
      case 'ECOLOGIST':
        return '/ecologist';
      case 'TOURIST':
        return '/tourist';
      case 'STAFF':
        return '/staff';
      default:
        return '/'; // fallback to home
    }
  };

  const userRole = user?.role || 'GUEST';
  const currentPath = location.pathname;
  const expectedPath = getRouteForRole();

  // If user is on wrong route for their role, redirect to correct dashboard
  if (userRole !== 'GUEST' && currentPath !== expectedPath) {
    return <Navigate to={expectedPath} replace />;
  }

  // Render children if on correct route
  return children;
};

export default RoleBasedRouter;
