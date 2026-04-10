import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PublicRoute = ({ children }) => {
  const { isAuthenticated, user, loading, getDashboardPath } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (isAuthenticated && user) {
    // Redirect to appropriate dashboard based on user role
    const userDashboard = getDashboardPath(user.role);
    return <Navigate to={userDashboard} replace />;
  }

  return children;
};

export default PublicRoute;
