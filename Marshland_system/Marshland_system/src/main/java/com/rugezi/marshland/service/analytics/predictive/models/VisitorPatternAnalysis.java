package com.rugezi.marshland.service.analytics.predictive.models;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * Visitor pattern analysis model for customer behavior insights
 */
public class VisitorPatternAnalysis {
    private String analysisPeriod;
    private LocalDate analyzedAt;
    private Map<String, Double> seasonalPatterns;
    private Map<String, Double> dayOfWeekPatterns;
    private Map<String, Double> monthlyTrends;
    private Map<String, Double> groupSizePreferences;
    private List<String> peakVisitingTimes;
    
    // Constructors
    public VisitorPatternAnalysis() {}
    
    public VisitorPatternAnalysis(String analysisPeriod, LocalDate analyzedAt,
                               Map<String, Double> seasonalPatterns, Map<String, Double> dayOfWeekPatterns,
                               Map<String, Double> monthlyTrends, Map<String, Double> groupSizePreferences,
                               List<String> peakVisitingTimes) {
        this.analysisPeriod = analysisPeriod;
        this.analyzedAt = analyzedAt;
        this.seasonalPatterns = seasonalPatterns;
        this.dayOfWeekPatterns = dayOfWeekPatterns;
        this.monthlyTrends = monthlyTrends;
        this.groupSizePreferences = groupSizePreferences;
        this.peakVisitingTimes = peakVisitingTimes;
    }
    
    // Getters and setters
    public String getAnalysisPeriod() { return analysisPeriod; }
    public void setAnalysisPeriod(String analysisPeriod) { this.analysisPeriod = analysisPeriod; }
    
    public LocalDate getAnalyzedAt() { return analyzedAt; }
    public void setAnalyzedAt(LocalDate analyzedAt) { this.analyzedAt = analyzedAt; }
    
    public Map<String, Double> getSeasonalPatterns() { return seasonalPatterns; }
    public void setSeasonalPatterns(Map<String, Double> seasonalPatterns) { this.seasonalPatterns = seasonalPatterns; }
    
    public Map<String, Double> getDayOfWeekPatterns() { return dayOfWeekPatterns; }
    public void setDayOfWeekPatterns(Map<String, Double> dayOfWeekPatterns) { this.dayOfWeekPatterns = dayOfWeekPatterns; }
    
    public Map<String, Double> getMonthlyTrends() { return monthlyTrends; }
    public void setMonthlyTrends(Map<String, Double> monthlyTrends) { this.monthlyTrends = monthlyTrends; }
    
    public Map<String, Double> getGroupSizePreferences() { return groupSizePreferences; }
    public void setGroupSizePreferences(Map<String, Double> groupSizePreferences) { this.groupSizePreferences = groupSizePreferences; }
    
    public List<String> getPeakVisitingTimes() { return peakVisitingTimes; }
    public void setPeakVisitingTimes(List<String> peakVisitingTimes) { this.peakVisitingTimes = peakVisitingTimes; }
}
