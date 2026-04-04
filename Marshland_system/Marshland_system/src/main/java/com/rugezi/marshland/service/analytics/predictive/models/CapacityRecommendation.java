package com.rugezi.marshland.service.analytics.predictive.models;

import com.rugezi.marshland.service.analytics.predictive.models.RecommendationType;

import java.time.LocalDate;

/**
 * Capacity recommendation model for optimization suggestions
 */
public class CapacityRecommendation {
    private LocalDate date;
    private int currentCapacity;
    private int optimalCapacity;
    private String reason;
    private int potentialIncrease;
    private RecommendationType recommendationType;
    
    // Constructors
    public CapacityRecommendation() {}
    
    public CapacityRecommendation(LocalDate date, int currentCapacity, int optimalCapacity,
                               String reason, int potentialIncrease, RecommendationType recommendationType) {
        this.date = date;
        this.currentCapacity = currentCapacity;
        this.optimalCapacity = optimalCapacity;
        this.reason = reason;
        this.potentialIncrease = potentialIncrease;
        this.recommendationType = recommendationType;
    }
    
    // Getters and setters
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
    
    public int getCurrentCapacity() { return currentCapacity; }
    public void setCurrentCapacity(int currentCapacity) { this.currentCapacity = currentCapacity; }
    
    public int getOptimalCapacity() { return optimalCapacity; }
    public void setOptimalCapacity(int optimalCapacity) { this.optimalCapacity = optimalCapacity; }
    
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
    
    public int getPotentialIncrease() { return potentialIncrease; }
    public void setPotentialIncrease(int potentialIncrease) { this.potentialIncrease = potentialIncrease; }
    
    public RecommendationType getRecommendationType() { return recommendationType; }
    public void setRecommendationType(RecommendationType recommendationType) { this.recommendationType = recommendationType; }
    
    @Override
    public String toString() {
        return String.format("CapacityRecommendation{date=%s, current=%d, optimal=%d, increase=%d, type=%s}",
                date, currentCapacity, optimalCapacity, potentialIncrease, recommendationType);
    }
}
