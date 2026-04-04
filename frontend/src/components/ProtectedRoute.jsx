import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    // Redirect to appropriate dashboard based on user role
    const roleDashboardMap = {
      'ADMIN': '/dashboard/admin',
      'ECOLOGIST': '/dashboard/ecologist',
      'TOURIST': '/dashboard/tourist',
      'STAFF': '/dashboard/staff',
    };
    
    const userDashboard = roleDashboardMap[user.role] || '/dashboard/tourist';
    return <Navigate to={userDashboard} replace />;
  }

  return children;
};

export default ProtectedRoute;
