package com.rugezi.marshland.service.analytics.predictive.models;

import java.util.List;

/**
 * Booking risk analysis model for cancellation probability assessment
 */
public class BookingRisk {
    private Long bookingId;
    private String userEmail;
    private double riskScore;
    private List<String> riskFactors;
    private String recommendation;
    
    // Constructors
    public BookingRisk() {}
    
    public BookingRisk(Long bookingId, String userEmail, double riskScore,
                      List<String> riskFactors, String recommendation) {
        this.bookingId = bookingId;
        this.userEmail = userEmail;
        this.riskScore = riskScore;
        this.riskFactors = riskFactors;
        this.recommendation = recommendation;
    }
    
    // Getters and setters
    public Long getBookingId() { return bookingId; }
    public void setBookingId(Long bookingId) { this.bookingId = bookingId; }
    
    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }
    
    public double getRiskScore() { return riskScore; }
    public void setRiskScore(double riskScore) { this.riskScore = riskScore; }
    
    public List<String> getRiskFactors() { return riskFactors; }
    public void setRiskFactors(List<String> riskFactors) { this.riskFactors = riskFactors; }
    
    public String getRecommendation() { return recommendation; }
    public void setRecommendation(String recommendation) { this.recommendation = recommendation; }
    
    @Override
    public String toString() {
        return String.format("BookingRisk{bookingId=%d, user=%s, score=%.2f, factors=%s}",
                bookingId, userEmail, riskScore, riskFactors);
    }
}
