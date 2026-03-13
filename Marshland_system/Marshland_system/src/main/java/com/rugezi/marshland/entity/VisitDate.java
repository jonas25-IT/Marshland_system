package com.rugezi.marshland.entity;

import jakarta.persistence.*;


import java.time.LocalDate;

@Entity
@Table(name = "visit_date")
public class VisitDate {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "date_id")
    private Long dateId;
    
    @Column(name = "visit_date", unique = true, nullable = false)
    private LocalDate visitDate;
    
    @Column(name = "max_capacity", nullable = false)
    private Integer maxCapacity;
    
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
    
    public Integer getMaxCapacity() { return maxCapacity; }
    public void setMaxCapacity(Integer maxCapacity) { this.maxCapacity = maxCapacity; }
    
    public Integer getCurrentBookings() { return currentBookings; }
    public void setCurrentBookings(Integer currentBookings) { this.currentBookings = currentBookings; }
    
    public Integer getRemainingCapacity() {
        return maxCapacity - currentBookings;
    }
    
    public boolean hasAvailableCapacity(Integer requestedVisitors) {
        return getRemainingCapacity() >= requestedVisitors;
    }
}
