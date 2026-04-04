package com.rugezi.marshland.service.analytics.predictive.models;

import com.rugezi.marshland.service.analytics.predictive.models.PredictionModel;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;

/**
 * Revenue forecast model for predicting future revenue
 */
public class RevenueForecast {
    private LocalDate startDate;
    private LocalDate endDate;
    private PredictionModel model;
    private LocalDate generatedAt;
    private double confidenceScore;
    private BigDecimal totalPredictedRevenue;
    private List<DailyRevenuePrediction> predictions;
    
    // Constructors
    public RevenueForecast() {}
    
    public RevenueForecast(LocalDate startDate, LocalDate endDate, PredictionModel model,
                          LocalDate generatedAt, double confidenceScore,
                          BigDecimal totalPredictedRevenue,
                          List<DailyRevenuePrediction> predictions) {
        this.startDate = startDate;
        this.endDate = endDate;
        this.model = model;
        this.generatedAt = generatedAt;
        this.confidenceScore = confidenceScore;
        this.totalPredictedRevenue = totalPredictedRevenue;
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
    
    public BigDecimal getTotalPredictedRevenue() { return totalPredictedRevenue; }
    public void setTotalPredictedRevenue(BigDecimal totalPredictedRevenue) { this.totalPredictedRevenue = totalPredictedRevenue; }
    
    public List<DailyRevenuePrediction> getPredictions() { return predictions; }
    public void setPredictions(List<DailyRevenuePrediction> predictions) { this.predictions = predictions; }
    
    /**
     * Get average daily predicted revenue
     */
    public BigDecimal getAverageDailyRevenue() {
        if (predictions.isEmpty()) {
            return BigDecimal.ZERO;
        }
        
        BigDecimal total = predictions.stream()
            .map(DailyRevenuePrediction::getPredictedRevenue)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        return total.divide(BigDecimal.valueOf(predictions.size()), 2, RoundingMode.HALF_UP);
    }
    
    /**
     * Get peak revenue day
     */
    public DailyRevenuePrediction getPeakRevenueDay() {
        return predictions.stream()
            .max((p1, p2) -> p1.getPredictedRevenue().compareTo(p2.getPredictedRevenue()))
            .orElse(null);
    }
}
