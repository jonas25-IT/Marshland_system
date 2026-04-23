package com.rugezi.marshland.converter;

import com.rugezi.marshland.entity.UserRole;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class UserRoleConverter implements AttributeConverter<UserRole, String> {

    @Override
    public String convertToDatabaseColumn(UserRole role) {
        if (role == null) {
            return null;
        }
        return role.name();
    }

    @Override
    public UserRole convertToEntityAttribute(String dbData) {
        if (dbData == null) {
            return null;
        }
        try {
            // Try direct conversion first
            return UserRole.valueOf(dbData.toUpperCase());
        } catch (IllegalArgumentException e) {
            // Handle case-insensitive matching for existing data
            for (UserRole role : UserRole.values()) {
                if (role.name().equalsIgnoreCase(dbData)) {
                    return role;
                }
            }
            throw new IllegalArgumentException("No enum constant com.rugezi.marshland.entity.UserRole." + dbData);
        }
    }
}
