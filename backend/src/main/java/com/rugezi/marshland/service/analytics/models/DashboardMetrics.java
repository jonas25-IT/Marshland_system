package com.rugezi.marshland.service.analytics.models;

import java.math.BigDecimal;
import java.util.Map;

/**
 * Comprehensive dashboard metrics for analytics display
 */
public class DashboardMetrics {
    private int totalBookings;
    private BigDecimal totalRevenue;
    private int totalVisitors;
    private BigDecimal averageBookingValue;
    private double approvalRate;
    private Map<String, Object> bookingTrends;
    private Map<String, Object> revenueTrends;
    private Map<String, Object> visitorDemographics;
    private Map<String, Object> peakBookingTimes;
    
    // Constructors
    public DashboardMetrics() {}
    
    public DashboardMetrics(int totalBookings, BigDecimal totalRevenue, int totalVisitors,
                          BigDecimal averageBookingValue, double approvalRate,
                          Map<String, Object> bookingTrends, Map<String, Object> revenueTrends,
                          Map<String, Object> visitorDemographics, Map<String, Object> peakBookingTimes) {
        this.totalBookings = totalBookings;
        this.totalRevenue = totalRevenue;
        this.totalVisitors = totalVisitors;
        this.averageBookingValue = averageBookingValue;
        this.approvalRate = approvalRate;
        this.bookingTrends = bookingTrends;
        this.revenueTrends = revenueTrends;
        this.visitorDemographics = visitorDemographics;
        this.peakBookingTimes = peakBookingTimes;
    }
    
    // Builder pattern
    public static Builder builder() {
        return new Builder();
    }
    
    // Getters and setters
    public int getTotalBookings() { return totalBookings; }
    public void setTotalBookings(int totalBookings) { this.totalBookings = totalBookings; }
    
    public BigDecimal getTotalRevenue() { return totalRevenue; }
    public void setTotalRevenue(BigDecimal totalRevenue) { this.totalRevenue = totalRevenue; }
    
    public int getTotalVisitors() { return totalVisitors; }
    public void setTotalVisitors(int totalVisitors) { this.totalVisitors = totalVisitors; }
    
    public BigDecimal getAverageBookingValue() { return averageBookingValue; }
    public void setAverageBookingValue(BigDecimal averageBookingValue) { this.averageBookingValue = averageBookingValue; }
    
    public double getApprovalRate() { return approvalRate; }
    public void setApprovalRate(double approvalRate) { this.approvalRate = approvalRate; }
    
    public Map<String, Object> getBookingTrends() { return bookingTrends; }
    public void setBookingTrends(Map<String, Object> bookingTrends) { this.bookingTrends = bookingTrends; }
    
    public Map<String, Object> getRevenueTrends() { return revenueTrends; }
    public void setRevenueTrends(Map<String, Object> revenueTrends) { this.revenueTrends = revenueTrends; }
    
    public Map<String, Object> getVisitorDemographics() { return visitorDemographics; }
    public void setVisitorDemographics(Map<String, Object> visitorDemographics) { this.visitorDemographics = visitorDemographics; }
    
    public Map<String, Object> getPeakBookingTimes() { return peakBookingTimes; }
    public void setPeakBookingTimes(Map<String, Object> peakBookingTimes) { this.peakBookingTimes = peakBookingTimes; }
    
    // Builder class
    public static class Builder {
        private int totalBookings;
        private BigDecimal totalRevenue;
        private int totalVisitors;
        private BigDecimal averageBookingValue;
        private double approvalRate;
        private Map<String, Object> bookingTrends;
        private Map<String, Object> revenueTrends;
        private Map<String, Object> visitorDemographics;
        private Map<String, Object> peakBookingTimes;
        
        public Builder totalBookings(int totalBookings) {
            this.totalBookings = totalBookings;
            return this;
        }
        
        public Builder totalRevenue(BigDecimal totalRevenue) {
            this.totalRevenue = totalRevenue;
            return this;
        }
        
        public Builder totalVisitors(int totalVisitors) {
            this.totalVisitors = totalVisitors;
            return this;
        }
        
        public Builder averageBookingValue(BigDecimal averageBookingValue) {
            this.averageBookingValue = averageBookingValue;
            return this;
        }
        
        public Builder approvalRate(double approvalRate) {
            this.approvalRate = approvalRate;
            return this;
        }
        
        public Builder bookingTrends(Map<String, Object> bookingTrends) {
            this.bookingTrends = bookingTrends;
            return this;
        }
        
        public Builder revenueTrends(Map<String, Object> revenueTrends) {
            this.revenueTrends = revenueTrends;
            return this;
        }
        
        public Builder visitorDemographics(Map<String, Object> visitorDemographics) {
            this.visitorDemographics = visitorDemographics;
            return this;
        }
        
        public Builder peakBookingTimes(Map<String, Object> peakBookingTimes) {
            this.peakBookingTimes = peakBookingTimes;
            return this;
        }
        
        public DashboardMetrics build() {
            return new DashboardMetrics(totalBookings, totalRevenue, totalVisitors, 
                                    averageBookingValue, approvalRate, bookingTrends, 
                                    revenueTrends, visitorDemographics, peakBookingTimes);
        }
    }
}
