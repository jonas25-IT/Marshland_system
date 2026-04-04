package com.rugezi.marshland.validator.constraints;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import java.time.LocalDate;

public class FutureDateValidator implements ConstraintValidator<FutureDate, LocalDate> {
    
    private int minDaysInAdvance;
    
    @Override
    public void initialize(FutureDate constraintAnnotation) {
        this.minDaysInAdvance = constraintAnnotation.minDaysInAdvance();
    }
    
    @Override
    public boolean isValid(LocalDate date, ConstraintValidatorContext context) {
        if (date == null) {
            return true; // Let @NotNull handle null validation
        }
        
        LocalDate today = LocalDate.now();
        LocalDate minAllowedDate = today.plusDays(minDaysInAdvance);
        
        return !date.isBefore(minAllowedDate);
    }
}
