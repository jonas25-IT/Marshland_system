package com.rugezi.marshland.converter;

import com.rugezi.marshland.entity.SpeciesType;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class SpeciesTypeConverter implements AttributeConverter<SpeciesType, String> {

    @Override
    public String convertToDatabaseColumn(SpeciesType type) {
        if (type == null) {
            return null;
        }
        return type.name();
    }

    @Override
    public SpeciesType convertToEntityAttribute(String dbData) {
        if (dbData == null) {
            return null;
        }
        try {
            // Try direct conversion first
            return SpeciesType.valueOf(dbData.toUpperCase());
        } catch (IllegalArgumentException e) {
            // Handle case-insensitive matching for existing data
            for (SpeciesType type : SpeciesType.values()) {
                if (type.name().equalsIgnoreCase(dbData)) {
                    return type;
                }
            }
            throw new IllegalArgumentException("No enum constant com.rugezi.marshland.entity.SpeciesType." + dbData);
        }
    }
}
