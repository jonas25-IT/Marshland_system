package com.rugezi.marshland.service.analytics.predictive.models;

import java.time.LocalDate;

/**
 * Daily prediction model for visitor forecasting
 */
public class DailyPrediction {
    private LocalDate date;
    private int predictedVisitors;
    private double confidence;
    
    // Constructors
    public DailyPrediction() {}
    
    public DailyPrediction(LocalDate date, int predictedVisitors, double confidence) {
        this.date = date;
        this.predictedVisitors = predictedVisitors;
        this.confidence = confidence;
    }
    
    // Getters and setters
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
    
    public int getPredictedVisitors() { return predictedVisitors; }
    public void setPredictedVisitors(int predictedVisitors) { this.predictedVisitors = predictedVisitors; }
    
    public double getConfidence() { return confidence; }
    public void setConfidence(double confidence) { this.confidence = confidence; }
    
    @Override
    public String toString() {
        return String.format("DailyPrediction{date=%s, visitors=%d, confidence=%.2f%%}",
                date, predictedVisitors, confidence * 100);
    }
}
