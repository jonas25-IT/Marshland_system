package com.rugezi.marshland.service.analytics.models;

import com.rugezi.marshland.entity.Booking;
import java.math.BigDecimal;
import java.util.List;

/**
 * Real-time metrics for live dashboard monitoring
 */
public class RealTimeMetrics {
    private int todayBookings;
    private BigDecimal todayRevenue;
    private int todayVisitors;
    private int pendingApprovals;
    private int activeUsers;
    private String systemUptime;
    private List<Booking> recentActivity;
    
    // Constructors
    public RealTimeMetrics() {}
    
    public RealTimeMetrics(int todayBookings, BigDecimal todayRevenue, int todayVisitors,
                         int pendingApprovals, int activeUsers, String systemUptime,
                         List<Booking> recentActivity) {
        this.todayBookings = todayBookings;
        this.todayRevenue = todayRevenue;
        this.todayVisitors = todayVisitors;
        this.pendingApprovals = pendingApprovals;
        this.activeUsers = activeUsers;
        this.systemUptime = systemUptime;
        this.recentActivity = recentActivity;
    }
    
    // Builder pattern
    public static Builder builder() {
        return new Builder();
    }
    
    // Getters and setters
    public int getTodayBookings() { return todayBookings; }
    public void setTodayBookings(int todayBookings) { this.todayBookings = todayBookings; }
    
    public BigDecimal getTodayRevenue() { return todayRevenue; }
    public void setTodayRevenue(BigDecimal todayRevenue) { this.todayRevenue = todayRevenue; }
    
    public int getTodayVisitors() { return todayVisitors; }
    public void setTodayVisitors(int todayVisitors) { this.todayVisitors = todayVisitors; }
    
    public int getPendingApprovals() { return pendingApprovals; }
    public void setPendingApprovals(int pendingApprovals) { this.pendingApprovals = pendingApprovals; }
    
    public int getActiveUsers() { return activeUsers; }
    public void setActiveUsers(int activeUsers) { this.activeUsers = activeUsers; }
    
    public String getSystemUptime() { return systemUptime; }
    public void setSystemUptime(String systemUptime) { this.systemUptime = systemUptime; }
    
    public List<Booking> getRecentActivity() { return recentActivity; }
    public void setRecentActivity(List<Booking> recentActivity) { this.recentActivity = recentActivity; }
    
    // Builder class
    public static class Builder {
        private int todayBookings;
        private BigDecimal todayRevenue;
        private int todayVisitors;
        private int pendingApprovals;
        private int activeUsers;
        private String systemUptime;
        private List<Booking> recentActivity;
        
        public Builder todayBookings(int todayBookings) {
            this.todayBookings = todayBookings;
            return this;
        }
        
        public Builder todayRevenue(BigDecimal todayRevenue) {
            this.todayRevenue = todayRevenue;
            return this;
        }
        
        public Builder todayVisitors(int todayVisitors) {
            this.todayVisitors = todayVisitors;
            return this;
        }
        
        public Builder pendingApprovals(int pendingApprovals) {
            this.pendingApprovals = pendingApprovals;
            return this;
        }
        
        public Builder activeUsers(int activeUsers) {
            this.activeUsers = activeUsers;
            return this;
        }
        
        public Builder systemUptime(String systemUptime) {
            this.systemUptime = systemUptime;
            return this;
        }
        
        public Builder recentActivity(List<Booking> recentActivity) {
            this.recentActivity = recentActivity;
            return this;
        }
        
        public RealTimeMetrics build() {
            return new RealTimeMetrics(todayBookings, todayRevenue, todayVisitors, 
                                    pendingApprovals, activeUsers, systemUptime, 
                                    recentActivity);
        }
    }
}
