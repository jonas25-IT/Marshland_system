package com.rugezi.marshland.service.analytics.models;

import java.util.List;
import java.util.Map;

/**
 * Visitor analytics data for customer behavior analysis
 */
public class VisitorAnalytics {
    private int totalVisitors;
    private int uniqueVisitors;
    private double repeatVisitorRate;
    private double averageGroupSize;
    private Map<String, Object> visitorTrends;
    private List<String> peakVisitingDays;
    private Map<String, Object> visitorSatisfaction;
    private Map<String, Object> demographicBreakdown;
    
    // Constructors
    public VisitorAnalytics() {}
    
    public VisitorAnalytics(int totalVisitors, int uniqueVisitors, double repeatVisitorRate,
                          double averageGroupSize, Map<String, Object> visitorTrends,
                          List<String> peakVisitingDays, Map<String, Object> visitorSatisfaction,
                          Map<String, Object> demographicBreakdown) {
        this.totalVisitors = totalVisitors;
        this.uniqueVisitors = uniqueVisitors;
        this.repeatVisitorRate = repeatVisitorRate;
        this.averageGroupSize = averageGroupSize;
        this.visitorTrends = visitorTrends;
        this.peakVisitingDays = peakVisitingDays;
        this.visitorSatisfaction = visitorSatisfaction;
        this.demographicBreakdown = demographicBreakdown;
    }
    
    // Builder pattern
    public static Builder builder() {
        return new Builder();
    }
    
    // Getters and setters
    public int getTotalVisitors() { return totalVisitors; }
    public void setTotalVisitors(int totalVisitors) { this.totalVisitors = totalVisitors; }
    
    public int getUniqueVisitors() { return uniqueVisitors; }
    public void setUniqueVisitors(int uniqueVisitors) { this.uniqueVisitors = uniqueVisitors; }
    
    public double getRepeatVisitorRate() { return repeatVisitorRate; }
    public void setRepeatVisitorRate(double repeatVisitorRate) { this.repeatVisitorRate = repeatVisitorRate; }
    
    public double getAverageGroupSize() { return averageGroupSize; }
    public void setAverageGroupSize(double averageGroupSize) { this.averageGroupSize = averageGroupSize; }
    
    public Map<String, Object> getVisitorTrends() { return visitorTrends; }
    public void setVisitorTrends(Map<String, Object> visitorTrends) { this.visitorTrends = visitorTrends; }
    
    public List<String> getPeakVisitingDays() { return peakVisitingDays; }
    public void setPeakVisitingDays(List<String> peakVisitingDays) { this.peakVisitingDays = peakVisitingDays; }
    
    public Map<String, Object> getVisitorSatisfaction() { return visitorSatisfaction; }
    public void setVisitorSatisfaction(Map<String, Object> visitorSatisfaction) { this.visitorSatisfaction = visitorSatisfaction; }
    
    public Map<String, Object> getDemographicBreakdown() { return demographicBreakdown; }
    public void setDemographicBreakdown(Map<String, Object> demographicBreakdown) { this.demographicBreakdown = demographicBreakdown; }
    
    // Builder class
    public static class Builder {
        private int totalVisitors;
        private int uniqueVisitors;
        private double repeatVisitorRate;
        private double averageGroupSize;
        private Map<String, Object> visitorTrends;
        private List<String> peakVisitingDays;
        private Map<String, Object> visitorSatisfaction;
        private Map<String, Object> demographicBreakdown;
        
        public Builder totalVisitors(int totalVisitors) {
            this.totalVisitors = totalVisitors;
            return this;
        }
        
        public Builder uniqueVisitors(int uniqueVisitors) {
            this.uniqueVisitors = uniqueVisitors;
            return this;
        }
        
        public Builder repeatVisitorRate(double repeatVisitorRate) {
            this.repeatVisitorRate = repeatVisitorRate;
            return this;
        }
        
        public Builder averageGroupSize(double averageGroupSize) {
            this.averageGroupSize = averageGroupSize;
            return this;
        }
        
        public Builder visitorTrends(Map<String, Object> visitorTrends) {
            this.visitorTrends = visitorTrends;
            return this;
        }
        
        public Builder peakVisitingDays(List<String> peakVisitingDays) {
            this.peakVisitingDays = peakVisitingDays;
            return this;
        }
        
        public Builder visitorSatisfaction(Map<String, Object> visitorSatisfaction) {
            this.visitorSatisfaction = visitorSatisfaction;
            return this;
        }
        
        public Builder demographicBreakdown(Map<String, Object> demographicBreakdown) {
            this.demographicBreakdown = demographicBreakdown;
            return this;
        }
        
        public VisitorAnalytics build() {
            return new VisitorAnalytics(totalVisitors, uniqueVisitors, repeatVisitorRate, 
                                    averageGroupSize, visitorTrends, peakVisitingDays, 
                                    visitorSatisfaction, demographicBreakdown);
        }
    }
}
