package com.rugezi.marshland.entity;

public enum SpeciesType {
    FLORA,
    FAUNA;
    
    public static SpeciesType fromString(String type) {
        if (type == null) {
            return null;
        }
        try {
            return SpeciesType.valueOf(type.toUpperCase());
        } catch (IllegalArgumentException e) {
            // Handle case-insensitive matching
            for (SpeciesType speciesType : SpeciesType.values()) {
                if (speciesType.name().equalsIgnoreCase(type)) {
                    return speciesType;
                }
            }
            throw new IllegalArgumentException("No enum constant com.rugezi.marshland.entity.SpeciesType." + type);
        }
    }
}
