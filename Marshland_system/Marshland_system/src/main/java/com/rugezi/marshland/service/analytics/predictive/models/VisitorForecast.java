package com.rugezi.marshland.service.analytics.predictive.models;

import com.rugezi.marshland.service.analytics.predictive.models.PredictionModel;

import java.time.LocalDate;
import java.util.List;

/**
 * Visitor forecast model for predicting future visitor numbers
 */
public class VisitorForecast {
    private LocalDate startDate;
    private LocalDate endDate;
    private PredictionModel model;
    private LocalDate generatedAt;
    private double confidenceScore;
    private List<DailyPrediction> predictions;
    
    // Constructors
    public VisitorForecast() {}
    
    public VisitorForecast(LocalDate startDate, LocalDate endDate, PredictionModel model,
                        LocalDate generatedAt, double confidenceScore,
                        List<DailyPrediction> predictions) {
        this.startDate = startDate;
        this.endDate = endDate;
        this.model = model;
        this.generatedAt = generatedAt;
        this.confidenceScore = confidenceScore;
        this.predictions = predictions;
    }
    
    // Getters and setters
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    
    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
    
    public PredictionModel getModel() { return model; }
    public void setModel(PredictionModel model) { this.model = model; }
    
    public LocalDate getGeneratedAt() { return generatedAt; }
    public void setGeneratedAt(LocalDate generatedAt) { this.generatedAt = generatedAt; }
    
    public double getConfidenceScore() { return confidenceScore; }
    public void setConfidenceScore(double confidenceScore) { this.confidenceScore = confidenceScore; }
    
    public List<DailyPrediction> getPredictions() { return predictions; }
    public void setPredictions(List<DailyPrediction> predictions) { this.predictions = predictions; }
    
    /**
     * Get total predicted visitors for the forecast period
     */
    public int getTotalPredictedVisitors() {
        return predictions.stream()
            .mapToInt(DailyPrediction::getPredictedVisitors)
            .sum();
    }
    
    /**
     * Get average daily prediction
     */
    public double getAverageDailyPrediction() {
        return predictions.isEmpty() ? 0.0 : 
            predictions.stream()
                .mapToInt(DailyPrediction::getPredictedVisitors)
                .average()
                .orElse(0.0);
    }
    
    /**
     * Get peak predicted day
     */
    public DailyPrediction getPeakPrediction() {
        return predictions.stream()
            .max((p1, p2) -> Integer.compare(p1.getPredictedVisitors(), p2.getPredictedVisitors()))
            .orElse(null);
    }
}
