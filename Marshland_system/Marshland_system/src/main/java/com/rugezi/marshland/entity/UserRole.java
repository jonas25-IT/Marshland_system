package com.rugezi.marshland.entity;

public enum UserRole {
    ADMIN,
    ECOLOGIST,
    TOURIST,
    STAFF;
    
    public static UserRole fromString(String role) {
        if (role == null) {
            return null;
        }
        try {
            return UserRole.valueOf(role.toUpperCase());
        } catch (IllegalArgumentException e) {
            // Handle case-insensitive matching
            for (UserRole userRole : UserRole.values()) {
                if (userRole.name().equalsIgnoreCase(role)) {
                    return userRole;
                }
            }
            throw new IllegalArgumentException("No enum constant com.rugezi.marshland.entity.UserRole." + role);
        }
    }
}
