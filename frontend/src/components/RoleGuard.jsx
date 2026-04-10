import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const RoleGuard = ({ children, allowedRoles, fallback = null }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return fallback || <div>Please login to access this content.</div>;
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return fallback || (
      <div className="text-center py-8">
        <div className="text-red-500 text-lg font-medium mb-2">Access Denied</div>
        <div className="text-gray-600">You don't have permission to access this page.</div>
      </div>
    );
  }

  return children;
};

export default RoleGuard;
