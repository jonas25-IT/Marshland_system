package com.rugezi.marshland.service.analytics.predictive.models;

import java.time.LocalDate;
import java.util.List;

/**
 * Cancellation risk analysis model for booking risk assessment
 */
public class CancellationRiskAnalysis {
    private LocalDate analyzedAt;
    private List<BookingRisk> bookingRisks;
    private long highRiskBookings;
    
    // Constructors
    public CancellationRiskAnalysis() {}
    
    public CancellationRiskAnalysis(LocalDate analyzedAt, List<BookingRisk> bookingRisks, long highRiskBookings) {
        this.analyzedAt = analyzedAt;
        this.bookingRisks = bookingRisks;
        this.highRiskBookings = highRiskBookings;
    }
    
    // Getters and setters
    public LocalDate getAnalyzedAt() { return analyzedAt; }
    public void setAnalyzedAt(LocalDate analyzedAt) { this.analyzedAt = analyzedAt; }
    
    public List<BookingRisk> getBookingRisks() { return bookingRisks; }
    public void setBookingRisks(List<BookingRisk> bookingRisks) { this.bookingRisks = bookingRisks; }
    
    public long getHighRiskBookings() { return highRiskBookings; }
    public void setHighRiskBookings(long highRiskBookings) { this.highRiskBookings = highRiskBookings; }
    
    /**
     * Get total bookings analyzed
     */
    public int getTotalBookings() {
        return bookingRisks != null ? bookingRisks.size() : 0;
    }
    
    /**
     * Get high risk percentage
     */
    public double getHighRiskPercentage() {
        int total = getTotalBookings();
        return total > 0 ? (double) highRiskBookings / total * 100 : 0.0;
    }
}
