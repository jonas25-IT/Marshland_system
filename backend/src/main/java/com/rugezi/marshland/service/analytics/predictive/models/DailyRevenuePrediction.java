package com.rugezi.marshland.service.analytics.predictive.models;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Daily revenue prediction model
 */
public class DailyRevenuePrediction {
    private LocalDate date;
    private BigDecimal predictedRevenue;
    private int predictedVisitors;
    private double confidence;
    
    // Constructors
    public DailyRevenuePrediction() {}
    
    public DailyRevenuePrediction(LocalDate date, BigDecimal predictedRevenue, 
                              int predictedVisitors, double confidence) {
        this.date = date;
        this.predictedRevenue = predictedRevenue;
        this.predictedVisitors = predictedVisitors;
        this.confidence = confidence;
    }
    
    // Getters and setters
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
    
    public BigDecimal getPredictedRevenue() { return predictedRevenue; }
    public void setPredictedRevenue(BigDecimal predictedRevenue) { this.predictedRevenue = predictedRevenue; }
    
    public int getPredictedVisitors() { return predictedVisitors; }
    public void setPredictedVisitors(int predictedVisitors) { this.predictedVisitors = predictedVisitors; }
    
    public double getConfidence() { return confidence; }
    public void setConfidence(double confidence) { this.confidence = confidence; }
    
    @Override
    public String toString() {
        return String.format("DailyRevenuePrediction{date=%s, revenue=$%.2f, visitors=%d, confidence=%.2f%%}",
                date, predictedRevenue, predictedVisitors, confidence * 100);
    }
}
