package com.rugezi.marshland.controller;

import com.rugezi.marshland.service.analytics.AnalyticsService;
import com.rugezi.marshland.service.analytics.models.*;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

/**
 * Analytics Controller for providing comprehensive analytics and reporting data
 */
@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AnalyticsController {
    
    private final AnalyticsService analyticsService;
    
    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }
    
    /**
     * Get comprehensive dashboard metrics
     */
    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<DashboardMetrics> getDashboardMetrics(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        if (startDate == null) {
            startDate = LocalDate.now().minusMonths(1);
        }
        if (endDate == null) {
            endDate = LocalDate.now();
        }
        
        DashboardMetrics metrics = analyticsService.getDashboardMetrics(startDate, endDate);
        return ResponseEntity.ok(metrics);
    }
    
    /**
     * Get real-time metrics for live dashboard
     */
    @GetMapping("/realtime")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<RealTimeMetrics> getRealTimeMetrics() {
        RealTimeMetrics metrics = analyticsService.getRealTimeMetrics();
        return ResponseEntity.ok(metrics);
    }
    
    /**
     * Get financial analytics
     */
    @GetMapping("/financial")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FinancialAnalytics> getFinancialAnalytics(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        if (startDate == null) {
            startDate = LocalDate.now().minusMonths(3);
        }
        if (endDate == null) {
            endDate = LocalDate.now();
        }
        
        FinancialAnalytics analytics = analyticsService.getFinancialAnalytics(startDate, endDate);
        return ResponseEntity.ok(analytics);
    }
    
    /**
     * Get visitor analytics
     */
    @GetMapping("/visitors")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<VisitorAnalytics> getVisitorAnalytics(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        if (startDate == null) {
            startDate = LocalDate.now().minusMonths(3);
        }
        if (endDate == null) {
            endDate = LocalDate.now();
        }
        
        VisitorAnalytics analytics = analyticsService.getVisitorAnalytics(startDate, endDate);
        return ResponseEntity.ok(analytics);
    }
    
    /**
     * Get operational analytics
     */
    @GetMapping("/operational")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<OperationalAnalytics> getOperationalAnalytics(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        if (startDate == null) {
            startDate = LocalDate.now().minusMonths(1);
        }
        if (endDate == null) {
            endDate = LocalDate.now();
        }
        
        OperationalAnalytics analytics = analyticsService.getOperationalAnalytics(startDate, endDate);
        return ResponseEntity.ok(analytics);
    }
    
    /**
     * Get booking trends
     */
    @GetMapping("/trends/bookings")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<?> getBookingTrends(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "monthly") String granularity) {
        
        if (startDate == null) {
            startDate = LocalDate.now().minusMonths(6);
        }
        if (endDate == null) {
            endDate = LocalDate.now();
        }
        
        // This would be implemented with more sophisticated trend analysis
        return ResponseEntity.ok(analyticsService.getDashboardMetrics(startDate, endDate).getBookingTrends());
    }
    
    /**
     * Get revenue trends
     */
    @GetMapping("/trends/revenue")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getRevenueTrends(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "monthly") String granularity) {
        
        if (startDate == null) {
            startDate = LocalDate.now().minusMonths(6);
        }
        if (endDate == null) {
            endDate = LocalDate.now();
        }
        
        return ResponseEntity.ok(analyticsService.getFinancialAnalytics(startDate, endDate).getRevenueByMonth());
    }
    
    /**
     * Get visitor demographics
     */
    @GetMapping("/demographics")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<?> getVisitorDemographics(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        if (startDate == null) {
            startDate = LocalDate.now().minusMonths(3);
        }
        if (endDate == null) {
            endDate = LocalDate.now();
        }
        
        return ResponseEntity.ok(analyticsService.getVisitorAnalytics(startDate, endDate).getDemographicBreakdown());
    }
    
    /**
     * Get system performance metrics
     */
    @GetMapping("/performance")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getSystemPerformance() {
        return ResponseEntity.ok(analyticsService.getOperationalAnalytics(
            LocalDate.now().minusDays(7), LocalDate.now()).getSystemPerformance());
    }
    
    /**
     * Get key performance indicators (KPIs)
     */
    @GetMapping("/kpi")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<?> getKPIs(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        if (startDate == null) {
            startDate = LocalDate.now().minusMonths(1);
        }
        if (endDate == null) {
            endDate = LocalDate.now();
        }
        
        DashboardMetrics dashboard = analyticsService.getDashboardMetrics(startDate, endDate);
        RealTimeMetrics realtime = analyticsService.getRealTimeMetrics();
        
        return ResponseEntity.ok(Map.of(
            "totalBookings", dashboard.getTotalBookings(),
            "totalRevenue", dashboard.getTotalRevenue(),
            "totalVisitors", dashboard.getTotalVisitors(),
            "approvalRate", dashboard.getApprovalRate(),
            "todayBookings", realtime.getTodayBookings(),
            "todayRevenue", realtime.getTodayRevenue(),
            "pendingApprovals", realtime.getPendingApprovals(),
            "activeUsers", realtime.getActiveUsers()
        ));
    }
}
