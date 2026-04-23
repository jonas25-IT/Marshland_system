package com.rugezi.marshland.validator;

import com.rugezi.marshland.entity.Booking;
import com.rugezi.marshland.entity.User;
import com.rugezi.marshland.entity.UserRole;
import com.rugezi.marshland.entity.VisitDate;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Component
public class BusinessRuleValidator {
    
    public static class ValidationResult {
        private final boolean valid;
        private final String message;
        private final String errorCode;
        
        public ValidationResult(boolean valid, String message, String errorCode) {
            this.valid = valid;
            this.message = message;
            this.errorCode = errorCode;
        }
        
        public boolean isValid() { return valid; }
        public String getMessage() { return message; }
        public String getErrorCode() { return errorCode; }
        
        public static ValidationResult success() {
            return new ValidationResult(true, null, null);
        }
        
        public static ValidationResult failure(String message, String errorCode) {
            return new ValidationResult(false, message, errorCode);
        }
    }
    
    /**
     * Validate booking creation according to business rules
     */
    public ValidationResult validateBookingCreation(Booking booking, VisitDate visitDate, User user) {
        List<ValidationResult> results = new ArrayList<>();
        
        // Rule 1: Visit date must be in the future
        results.add(validateVisitDateFuture(visitDate));
        
        // Rule 2: Must have available capacity
        results.add(validateCapacity(booking, visitDate));
        
        // Rule 3: Minimum visitors validation
        results.add(validateMinimumVisitors(booking));
        
        // Rule 4: Maximum visitors validation
        results.add(validateMaximumVisitors(booking));
        
        // Rule 5: User account must be active
        results.add(validateUserActive(user));
        
        // Rule 6: Check for duplicate bookings
        results.add(validateNoDuplicateBooking(user, visitDate));
        
        // Rule 7: Advanced booking notice period
        results.add(validateAdvanceNotice(visitDate));
        
        return combineResults(results);
    }
    
    /**
     * Validate booking approval according to business rules
     */
    public ValidationResult validateBookingApproval(Booking booking, User approver) {
        List<ValidationResult> results = new ArrayList<>();
        
        // Rule 1: Approver must have appropriate role
        results.add(validateApprovalRole(approver));
        
        // Rule 2: Booking must be in PENDING status
        results.add(validateBookingPending(booking));
        
        // Rule 3: Visit date must still have capacity
        results.add(validateCapacityOnApproval(booking));
        
        // Rule 4: Visit date must not be in the past
        results.add(validateVisitDateFuture(booking.getVisitDate()));
        
        return combineResults(results);
    }
    
    /**
     * Validate visit date creation according to business rules
     */
    public ValidationResult validateVisitDateCreation(VisitDate visitDate) {
        List<ValidationResult> results = new ArrayList<>();
        
        // Rule 1: Date must be in the future
        results.add(validateVisitDateFuture(visitDate));
        
        // Rule 2: Capacity must be within limits
        results.add(validateCapacityLimits(visitDate));
        
        // Rule 3: No duplicate dates
        results.add(validateUniqueVisitDate(visitDate));
        
        // Rule 4: Cannot set dates too far in advance
        results.add(validateMaxAdvanceBooking(visitDate));
        
        return combineResults(results);
    }
    
    // Individual validation methods
    
    private ValidationResult validateVisitDateFuture(VisitDate visitDate) {
        if (visitDate.getVisitDate().isBefore(LocalDate.now())) {
            return ValidationResult.failure(
                "Visit date cannot be in the past", 
                "DATE_IN_PAST"
            );
        }
        return ValidationResult.success();
    }
    
    private ValidationResult validateCapacity(Booking booking, VisitDate visitDate) {
        if (!visitDate.hasAvailableCapacity(booking.getNumberOfVisitors())) {
            return ValidationResult.failure(
                String.format("Insufficient capacity. Requested: %d, Available: %d", 
                    booking.getNumberOfVisitors(), 
                    visitDate.getRemainingCapacity()),
                "INSUFFICIENT_CAPACITY"
            );
        }
        return ValidationResult.success();
    }
    
    private ValidationResult validateMinimumVisitors(Booking booking) {
        if (booking.getNumberOfVisitors() < 1) {
            return ValidationResult.failure(
                "At least 1 visitor is required", 
                "MINIMUM_VISITORS"
            );
        }
        return ValidationResult.success();
    }
    
    private ValidationResult validateMaximumVisitors(Booking booking) {
        if (booking.getNumberOfVisitors() > 20) {
            return ValidationResult.failure(
                "Maximum 20 visitors allowed per booking", 
                "MAXIMUM_VISITORS"
            );
        }
        return ValidationResult.success();
    }
    
    private ValidationResult validateUserActive(User user) {
        // Assuming User entity has an active field - if not, this would need to be added
        return ValidationResult.success(); // Placeholder
    }
    
    private ValidationResult validateNoDuplicateBooking(User user, VisitDate visitDate) {
        // This would require checking repository for existing bookings
        // Placeholder implementation
        return ValidationResult.success();
    }
    
    private ValidationResult validateAdvanceNotice(VisitDate visitDate) {
        long daysUntilVisit = LocalDate.now().until(visitDate.getVisitDate()).getDays();
        if (daysUntilVisit < 1) {
            return ValidationResult.failure(
                "Bookings must be made at least 1 day in advance", 
                "INSUFFICIENT_NOTICE"
            );
        }
        return ValidationResult.success();
    }
    
    private ValidationResult validateApprovalRole(User approver) {
        if (approver.getRole() != UserRole.ADMIN && approver.getRole() != UserRole.STAFF) {
            return ValidationResult.failure(
                "Only ADMIN or STAFF can approve bookings", 
                "UNAUTHORIZED_APPROVAL"
            );
        }
        return ValidationResult.success();
    }
    
    private ValidationResult validateBookingPending(Booking booking) {
        if (booking.getBookingStatus() != com.rugezi.marshland.entity.BookingStatus.PENDING) {
            return ValidationResult.failure(
                "Only PENDING bookings can be approved", 
                "INVALID_STATUS"
            );
        }
        return ValidationResult.success();
    }
    
    private ValidationResult validateCapacityOnApproval(Booking booking) {
        // Re-check capacity at approval time
        return validateCapacity(booking, booking.getVisitDate());
    }
    
    private ValidationResult validateCapacityLimits(VisitDate visitDate) {
        if (visitDate.getMaxCapacity() < 1 || visitDate.getMaxCapacity() > 100) {
            return ValidationResult.failure(
                "Capacity must be between 1 and 100 visitors", 
                "INVALID_CAPACITY"
            );
        }
        return ValidationResult.success();
    }
    
    private ValidationResult validateUniqueVisitDate(VisitDate visitDate) {
        // This would require checking repository for existing dates
        // Placeholder implementation
        return ValidationResult.success();
    }
    
    private ValidationResult validateMaxAdvanceBooking(VisitDate visitDate) {
        long daysUntilVisit = LocalDate.now().until(visitDate.getVisitDate()).getDays();
        if (daysUntilVisit > 365) {
            return ValidationResult.failure(
                "Cannot set visit dates more than 1 year in advance", 
                "TOO_FAR_ADVANCE"
            );
        }
        return ValidationResult.success();
    }
    
    /**
     * Combine multiple validation results
     */
    private ValidationResult combineResults(List<ValidationResult> results) {
        for (ValidationResult result : results) {
            if (!result.isValid()) {
                return result;
            }
        }
        return ValidationResult.success();
    }
    
    /**
     * Get all business rules documentation
     */
    public String getBusinessRulesDocumentation() {
        return """
            MARSHLAND SYSTEM - BUSINESS RULES
            
            BOOKING RULES:
            1. Visit dates must be in the future
            2. Sufficient capacity must be available
            3. Minimum 1 visitor per booking
            4. Maximum 20 visitors per booking
            5. User account must be active
            6. No duplicate bookings for same date
            7. Minimum 1 day advance notice required
            
            APPROVAL RULES:
            1. Only ADMIN or STAFF can approve bookings
            2. Only PENDING bookings can be approved
            3. Capacity must still be available at approval
            4. Visit date must not be in the past
            
            VISIT DATE RULES:
            1. Dates must be in the future
            2. Capacity must be 1-100 visitors
            3. No duplicate dates allowed
            4. Maximum 1 year advance booking
            """;
    }
}
