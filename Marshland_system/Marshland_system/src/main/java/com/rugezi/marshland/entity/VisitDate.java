package com.rugezi.marshland.entity;

import com.rugezi.marshland.validator.constraints.FutureDate;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;

import java.time.LocalDate;

@Entity
@Table(name = "visit_date")
public class VisitDate {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "date_id")
    private Long dateId;
    
    @FutureDate(minDaysInAdvance = 1, message = "Visit date must be at least 1 day in the future")
    @NotNull(message = "Visit date is required")
    @Column(name = "visit_date", unique = true, nullable = false)
    private LocalDate visitDate;
    
    @Min(value = 1, message = "Minimum capacity is 1 visitor")
    @Max(value = 100, message = "Maximum capacity is 100 visitors")
    @NotNull(message = "Maximum capacity is required")
    @Column(name = "max_capacity", nullable = false)
    private Integer maxCapacity;
    
    @Min(value = 0, message = "Current bookings cannot be negative")
    @Column(name = "current_bookings")
    private Integer currentBookings = 0;
    
    // Constructors
    public VisitDate() {}
    
    public VisitDate(LocalDate visitDate, Integer maxCapacity) {
        this.visitDate = visitDate;
        this.maxCapacity = maxCapacity;
    }
    
    // Getters and Setters
    public Long getDateId() { return dateId; }
    public void setDateId(Long dateId) { this.dateId = dateId; }
    
    public LocalDate getVisitDate() { return visitDate; }
    public void setVisitDate(LocalDate visitDate) { this.visitDate = visitDate; }
    
    // Alias for visitDate to match controller expectations
    public LocalDate getDate() { return visitDate; }
    
    public Integer getMaxCapacity() { return maxCapacity; }
    public void setMaxCapacity(Integer maxCapacity) { this.maxCapacity = maxCapacity; }
    
    public Integer getCurrentBookings() { return currentBookings; }
    public void setCurrentBookings(Integer currentBookings) { this.currentBookings = currentBookings; }
    
    public Integer getRemainingCapacity() {
        return maxCapacity != null && currentBookings != null ? 
               maxCapacity - currentBookings : 0;
    }
    
    public boolean hasAvailableCapacity(Integer requestedVisitors) {
        return getRemainingCapacity() >= requestedVisitors;
    }
}
