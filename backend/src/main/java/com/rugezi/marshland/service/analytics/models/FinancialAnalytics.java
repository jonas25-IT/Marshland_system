package com.rugezi.marshland.service.analytics.models;

import java.math.BigDecimal;
import java.util.Map;

/**
 * Financial analytics data for revenue and pricing analysis
 */
public class FinancialAnalytics {
    private BigDecimal totalRevenue;
    private BigDecimal averageRevenuePerBooking;
    private Map<String, BigDecimal> revenueByMonth;
    private Map<String, BigDecimal> revenueByDayOfWeek;
    private Map<String, Object> pricingEffectiveness;
    private Map<String, Object> discountImpact;
    private Map<String, Object> seasonalRevenueAnalysis;
    
    // Constructors
    public FinancialAnalytics() {}
    
    public FinancialAnalytics(BigDecimal totalRevenue, BigDecimal averageRevenuePerBooking, 
                           Map<String, BigDecimal> revenueByMonth, Map<String, BigDecimal> revenueByDayOfWeek,
                           Map<String, Object> pricingEffectiveness, Map<String, Object> discountImpact,
                           Map<String, Object> seasonalRevenueAnalysis) {
        this.totalRevenue = totalRevenue;
        this.averageRevenuePerBooking = averageRevenuePerBooking;
        this.revenueByMonth = revenueByMonth;
        this.revenueByDayOfWeek = revenueByDayOfWeek;
        this.pricingEffectiveness = pricingEffectiveness;
        this.discountImpact = discountImpact;
        this.seasonalRevenueAnalysis = seasonalRevenueAnalysis;
    }
    
    // Builder pattern
    public static Builder builder() {
        return new Builder();
    }
    
    // Getters and setters
    public BigDecimal getTotalRevenue() { return totalRevenue; }
    public void setTotalRevenue(BigDecimal totalRevenue) { this.totalRevenue = totalRevenue; }
    
    public BigDecimal getAverageRevenuePerBooking() { return averageRevenuePerBooking; }
    public void setAverageRevenuePerBooking(BigDecimal averageRevenuePerBooking) { this.averageRevenuePerBooking = averageRevenuePerBooking; }
    
    public Map<String, BigDecimal> getRevenueByMonth() { return revenueByMonth; }
    public void setRevenueByMonth(Map<String, BigDecimal> revenueByMonth) { this.revenueByMonth = revenueByMonth; }
    
    public Map<String, BigDecimal> getRevenueByDayOfWeek() { return revenueByDayOfWeek; }
    public void setRevenueByDayOfWeek(Map<String, BigDecimal> revenueByDayOfWeek) { this.revenueByDayOfWeek = revenueByDayOfWeek; }
    
    public Map<String, Object> getPricingEffectiveness() { return pricingEffectiveness; }
    public void setPricingEffectiveness(Map<String, Object> pricingEffectiveness) { this.pricingEffectiveness = pricingEffectiveness; }
    
    public Map<String, Object> getDiscountImpact() { return discountImpact; }
    public void setDiscountImpact(Map<String, Object> discountImpact) { this.discountImpact = discountImpact; }
    
    public Map<String, Object> getSeasonalRevenueAnalysis() { return seasonalRevenueAnalysis; }
    public void setSeasonalRevenueAnalysis(Map<String, Object> seasonalRevenueAnalysis) { this.seasonalRevenueAnalysis = seasonalRevenueAnalysis; }
    
    // Builder class
    public static class Builder {
        private BigDecimal totalRevenue;
        private BigDecimal averageRevenuePerBooking;
        private Map<String, BigDecimal> revenueByMonth;
        private Map<String, BigDecimal> revenueByDayOfWeek;
        private Map<String, Object> pricingEffectiveness;
        private Map<String, Object> discountImpact;
        private Map<String, Object> seasonalRevenueAnalysis;
        
        public Builder totalRevenue(BigDecimal totalRevenue) {
            this.totalRevenue = totalRevenue;
            return this;
        }
        
        public Builder averageRevenuePerBooking(BigDecimal averageRevenuePerBooking) {
            this.averageRevenuePerBooking = averageRevenuePerBooking;
            return this;
        }
        
        public Builder revenueByMonth(Map<String, BigDecimal> revenueByMonth) {
            this.revenueByMonth = revenueByMonth;
            return this;
        }
        
        public Builder revenueByDayOfWeek(Map<String, BigDecimal> revenueByDayOfWeek) {
            this.revenueByDayOfWeek = revenueByDayOfWeek;
            return this;
        }
        
        public Builder pricingEffectiveness(Map<String, Object> pricingEffectiveness) {
            this.pricingEffectiveness = pricingEffectiveness;
            return this;
        }
        
        public Builder discountImpact(Map<String, Object> discountImpact) {
            this.discountImpact = discountImpact;
            return this;
        }
        
        public Builder seasonalRevenueAnalysis(Map<String, Object> seasonalRevenueAnalysis) {
            this.seasonalRevenueAnalysis = seasonalRevenueAnalysis;
            return this;
        }
        
        public FinancialAnalytics build() {
            return new FinancialAnalytics(totalRevenue, averageRevenuePerBooking, revenueByMonth, 
                                      revenueByDayOfWeek, pricingEffectiveness, discountImpact, 
                                      seasonalRevenueAnalysis);
        }
    }
}
