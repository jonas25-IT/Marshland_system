// Role-based permissions configuration
export const ROLE_PERMISSIONS = {
  ADMIN: [
    'read:users',
    'write:users',
    'delete:users',
    'read:bookings',
    'write:bookings',
    'delete:bookings',
    'read:species',
    'write:species',
    'delete:species',
    'read:feedback',
    'delete:feedback',
    'read:analytics',
    'read:reports',
    'write:reports',
    'manage:gallery',
    'system:admin'
  ],
  ECOLOGIST: [
    'read:species',
    'write:species',
    'delete:species',
    'read:bookings',
    'read:feedback',
    'read:analytics',
    'read:reports',
    'write:reports',
    'manage:gallery'
  ],
  TOURIST: [
    'read:species',
    'write:bookings',
    'read:own_bookings',
    'write:feedback',
    'read:own_feedback',
    'read:gallery'
  ],
  STAFF: [
    'read:bookings',
    'write:bookings',
    'read:users',
    'read:feedback',
    'read:analytics',
    'read:reports',
    'manage:gallery'
  ]
};

// Permission checking utility
export const hasPermission = (userRole, permission) => {
  if (!userRole || !ROLE_PERMISSIONS[userRole]) {
    return false;
  }
  return ROLE_PERMISSIONS[userRole].includes(permission);
};

// Multiple permissions check
export const hasAnyPermission = (userRole, permissions) => {
  if (!userRole || !ROLE_PERMISSIONS[userRole]) {
    return false;
  }
  return permissions.some(permission => ROLE_PERMISSIONS[userRole].includes(permission));
};

// All permissions check
export const hasAllPermissions = (userRole, permissions) => {
  if (!userRole || !ROLE_PERMISSIONS[userRole]) {
    return false;
  }
  return permissions.every(permission => ROLE_PERMISSIONS[userRole].includes(permission));
};

// Role hierarchy for access control
export const ROLE_HIERARCHY = {
  ADMIN: 4,
  ECOLOGIST: 3,
  STAFF: 2,
  TOURIST: 1
};

// Check if user has higher or equal role
export const hasRoleLevel = (userRole, requiredRole) => {
  if (!userRole || !requiredRole) return false;
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
};

// Get dashboard path for role
export const getRoleDashboardPath = (role) => {
  const dashboardPaths = {
    ADMIN: '/dashboard/admin',
    ECOLOGIST: '/dashboard/ecologist',
    TOURIST: '/dashboard/tourist',
    STAFF: '/dashboard/staff'
  };
  return dashboardPaths[role] || '/dashboard/tourist';
};

// Role display names
export const ROLE_DISPLAY_NAMES = {
  ADMIN: 'Administrator',
  ECOLOGIST: 'Ecologist',
  TOURIST: 'Tourist',
  STAFF: 'Staff Member'
};

export default {
  ROLE_PERMISSIONS,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  hasRoleLevel,
  getRoleDashboardPath,
  ROLE_DISPLAY_NAMES,
  ROLE_HIERARCHY
};
