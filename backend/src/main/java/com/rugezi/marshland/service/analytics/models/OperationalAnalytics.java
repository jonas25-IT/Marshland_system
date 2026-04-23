package com.rugezi.marshland.service.analytics.models;

import java.util.Map;

/**
 * Operational analytics data for system performance and efficiency analysis
 */
public class OperationalAnalytics {
    private double bookingProcessingTime;
    private double approvalRate;
    private double rejectionRate;
    private Map<String, Object> staffPerformance;
    private double capacityUtilization;
    private Map<String, Object> systemPerformance;
    private Map<String, Object> errorRates;
    private Map<String, Object> efficiencyMetrics;
    
    // Constructors
    public OperationalAnalytics() {}
    
    public OperationalAnalytics(double bookingProcessingTime, double approvalRate, double rejectionRate,
                            Map<String, Object> staffPerformance, double capacityUtilization,
                            Map<String, Object> systemPerformance, Map<String, Object> errorRates,
                            Map<String, Object> efficiencyMetrics) {
        this.bookingProcessingTime = bookingProcessingTime;
        this.approvalRate = approvalRate;
        this.rejectionRate = rejectionRate;
        this.staffPerformance = staffPerformance;
        this.capacityUtilization = capacityUtilization;
        this.systemPerformance = systemPerformance;
        this.errorRates = errorRates;
        this.efficiencyMetrics = efficiencyMetrics;
    }
    
    // Builder pattern
    public static Builder builder() {
        return new Builder();
    }
    
    // Getters and setters
    public double getBookingProcessingTime() { return bookingProcessingTime; }
    public void setBookingProcessingTime(double bookingProcessingTime) { this.bookingProcessingTime = bookingProcessingTime; }
    
    public double getApprovalRate() { return approvalRate; }
    public void setApprovalRate(double approvalRate) { this.approvalRate = approvalRate; }
    
    public double getRejectionRate() { return rejectionRate; }
    public void setRejectionRate(double rejectionRate) { this.rejectionRate = rejectionRate; }
    
    public Map<String, Object> getStaffPerformance() { return staffPerformance; }
    public void setStaffPerformance(Map<String, Object> staffPerformance) { this.staffPerformance = staffPerformance; }
    
    public double getCapacityUtilization() { return capacityUtilization; }
    public void setCapacityUtilization(double capacityUtilization) { this.capacityUtilization = capacityUtilization; }
    
    public Map<String, Object> getSystemPerformance() { return systemPerformance; }
    public void setSystemPerformance(Map<String, Object> systemPerformance) { this.systemPerformance = systemPerformance; }
    
    public Map<String, Object> getErrorRates() { return errorRates; }
    public void setErrorRates(Map<String, Object> errorRates) { this.errorRates = errorRates; }
    
    public Map<String, Object> getEfficiencyMetrics() { return efficiencyMetrics; }
    public void setEfficiencyMetrics(Map<String, Object> efficiencyMetrics) { this.efficiencyMetrics = efficiencyMetrics; }
    
    // Builder class
    public static class Builder {
        private double bookingProcessingTime;
        private double approvalRate;
        private double rejectionRate;
        private Map<String, Object> staffPerformance;
        private double capacityUtilization;
        private Map<String, Object> systemPerformance;
        private Map<String, Object> errorRates;
        private Map<String, Object> efficiencyMetrics;
        
        public Builder bookingProcessingTime(double bookingProcessingTime) {
            this.bookingProcessingTime = bookingProcessingTime;
            return this;
        }
        
        public Builder approvalRate(double approvalRate) {
            this.approvalRate = approvalRate;
            return this;
        }
        
        public Builder rejectionRate(double rejectionRate) {
            this.rejectionRate = rejectionRate;
            return this;
        }
        
        public Builder staffPerformance(Map<String, Object> staffPerformance) {
            this.staffPerformance = staffPerformance;
            return this;
        }
        
        public Builder capacityUtilization(double capacityUtilization) {
            this.capacityUtilization = capacityUtilization;
            return this;
        }
        
        public Builder systemPerformance(Map<String, Object> systemPerformance) {
            this.systemPerformance = systemPerformance;
            return this;
        }
        
        public Builder errorRates(Map<String, Object> errorRates) {
            this.errorRates = errorRates;
            return this;
        }
        
        public Builder efficiencyMetrics(Map<String, Object> efficiencyMetrics) {
            this.efficiencyMetrics = efficiencyMetrics;
            return this;
        }
        
        public OperationalAnalytics build() {
            return new OperationalAnalytics(bookingProcessingTime, approvalRate, rejectionRate,
                                      staffPerformance, capacityUtilization, systemPerformance,
                                      errorRates, efficiencyMetrics);
        }
    }
}
