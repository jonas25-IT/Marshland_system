package com.rugezi.marshland.controller;

import com.rugezi.marshland.entity.SystemActivity;
import com.rugezi.marshland.service.SystemActivityService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/system-activity")
@PreAuthorize("hasRole('ADMIN')")
public class SystemActivityController {
    
    private final SystemActivityService systemActivityService;
    
    public SystemActivityController(SystemActivityService systemActivityService) {
        this.systemActivityService = systemActivityService;
    }
    
    /**
     * Get all system activities with pagination
     */
    @GetMapping
    public ResponseEntity<List<SystemActivity>> getAllActivities() {
        List<SystemActivity> activities = systemActivityService.getAllActivities(org.springframework.data.domain.PageRequest.of(0, 100)).getContent();
        return ResponseEntity.ok(activities);
    }
    
    /**
     * Get recent activities (last 24 hours)
     */
    @GetMapping("/recent")
    public ResponseEntity<List<SystemActivity>> getRecentActivities() {
        List<SystemActivity> activities = systemActivityService.getRecentActivities();
        return ResponseEntity.ok(activities);
    }
    
    /**
     * Get activities by date range
     */
    @GetMapping("/range")
    public ResponseEntity<List<SystemActivity>> getActivitiesByDateRange(
            @RequestParam String startDate,
            @RequestParam String endDate) {
        LocalDateTime start = LocalDateTime.parse(startDate);
        LocalDateTime end = LocalDateTime.parse(endDate);
        List<SystemActivity> activities = systemActivityService.getActivitiesByDateRange(start, end);
        return ResponseEntity.ok(activities);
    }
    
    /**
     * Get activities by action type
     */
    @GetMapping("/action/{action}")
    public ResponseEntity<List<SystemActivity>> getActivitiesByAction(@PathVariable String action) {
        List<SystemActivity> activities = systemActivityService.getActivitiesByAction(action);
        return ResponseEntity.ok(activities);
    }
    
    /**
     * Get activities by entity type
     */
    @GetMapping("/entity/{entityType}")
    public ResponseEntity<List<SystemActivity>> getActivitiesByEntityType(@PathVariable String entityType) {
        List<SystemActivity> activities = systemActivityService.getActivitiesByEntityType(entityType);
        return ResponseEntity.ok(activities);
    }
    
    /**
     * Get activities by user
     */
    @GetMapping("/user/{userEmail}")
    public ResponseEntity<List<SystemActivity>> getActivitiesByUser(@PathVariable String userEmail) {
        List<SystemActivity> activities = systemActivityService.getActivitiesByUser(userEmail);
        return ResponseEntity.ok(activities);
    }
    
    /**
     * Get login activities
     */
    @GetMapping("/logins")
    public ResponseEntity<List<SystemActivity>> getLoginActivities() {
        List<SystemActivity> activities = systemActivityService.getLoginActivities();
        return ResponseEntity.ok(activities);
    }
    
    /**
     * Get booking decision activities
     */
    @GetMapping("/booking-decisions")
    public ResponseEntity<List<SystemActivity>> getBookingDecisionActivities() {
        List<SystemActivity> activities = systemActivityService.getBookingDecisionActivities();
        return ResponseEntity.ok(activities);
    }
    
    /**
     * Get deletion activities
     */
    @GetMapping("/deletions")
    public ResponseEntity<List<SystemActivity>> getDeletionActivities() {
        List<SystemActivity> activities = systemActivityService.getDeletionActivities();
        return ResponseEntity.ok(activities);
    }
    
    /**
     * Get failed activities
     */
    @GetMapping("/failed")
    public ResponseEntity<List<SystemActivity>> getFailedActivities() {
        List<SystemActivity> activities = systemActivityService.getFailedActivities();
        return ResponseEntity.ok(activities);
    }
    
    /**
     * Search activities
     */
    @GetMapping("/search")
    public ResponseEntity<List<SystemActivity>> searchActivities(@RequestParam String keyword) {
        List<SystemActivity> activities = systemActivityService.searchActivities(keyword);
        return ResponseEntity.ok(activities);
    }
    
    /**
     * Get activity statistics for dashboard
     */
    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getActivityStatistics() {
        Map<String, Object> statistics = systemActivityService.getActivityStatistics();
        return ResponseEntity.ok(statistics);
    }
    
    /**
     * Get hourly activity count for charts
     */
    @GetMapping("/hourly-count")
    public ResponseEntity<Map<Integer, Long>> getHourlyActivityCount() {
        Map<Integer, Long> hourlyCount = systemActivityService.getHourlyActivityCount();
        return ResponseEntity.ok(hourlyCount);
    }
    
    /**
     * Get daily activity count for charts
     */
    @GetMapping("/daily-count")
    public ResponseEntity<Map<String, Long>> getDailyActivityCount() {
        Map<String, Long> dailyCount = systemActivityService.getDailyActivityCount();
        return ResponseEntity.ok(dailyCount);
    }
    
    /**
     * Get activity counts by action type
     */
    @GetMapping("/count-by-action")
    public ResponseEntity<Map<String, Long>> getActivitiesByActionCount() {
        Map<String, Long> actionCounts = systemActivityService.getActivitiesByActionCount();
        return ResponseEntity.ok(actionCounts);
    }
    
    /**
     * Get activity counts by entity type
     */
    @GetMapping("/count-by-entity")
    public ResponseEntity<Map<String, Long>> getActivitiesByEntityTypeCount() {
        Map<String, Long> entityCounts = systemActivityService.getActivitiesByEntityTypeCount();
        return ResponseEntity.ok(entityCounts);
    }
    
    /**
     * Get activity counts by user
     */
    @GetMapping("/count-by-user")
    public ResponseEntity<Map<String, Long>> getActivitiesByUserCount() {
        Map<String, Long> userCounts = systemActivityService.getActivitiesByUserCount();
        return ResponseEntity.ok(userCounts);
    }
}
