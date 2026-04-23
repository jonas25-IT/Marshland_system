package com.rugezi.marshland.service;

import com.rugezi.marshland.entity.SystemActivity;
import com.rugezi.marshland.repository.SystemActivityRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SystemActivityService {
    
    private final SystemActivityRepository systemActivityRepository;
    
    /**
     * Log a system activity
     */
    public void logActivity(SystemActivity activity, HttpServletRequest request) {
        try {
            systemActivityRepository.save(activity);
            System.out.println("Activity logged: " + activity.getAction() + " " + activity.getEntityType() + " by " + activity.getPerformedBy());
        } catch (Exception e) {
            System.err.println("Failed to log activity: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    /**
     * Log activity without HTTP request context
     */
    public void logActivity(SystemActivity activity) {
        logActivity(activity, null);
    }
    
    /**
     * Get all activities with pagination
     */
    public Page<SystemActivity> getAllActivities(Pageable pageable) {
        return systemActivityRepository.findAll(pageable);
    }
    
    /**
     * Get recent activities (last 24 hours)
     */
    public List<SystemActivity> getRecentActivities() {
        LocalDateTime since = LocalDateTime.now().minusHours(24);
        return systemActivityRepository.findRecentActivities(since);
    }
    
    /**
     * Get activities in date range
     */
    public List<SystemActivity> getActivitiesByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return systemActivityRepository.findByTimestampBetweenOrderByTimestampDesc(startDate, endDate);
    }
    
    /**
     * Get activities by action type
     */
    public List<SystemActivity> getActivitiesByAction(String action) {
        return systemActivityRepository.findByActionOrderByTimestampDesc(action);
    }
    
    /**
     * Get activities by entity type
     */
    public List<SystemActivity> getActivitiesByEntityType(String entityType) {
        return systemActivityRepository.findByEntityTypeOrderByTimestampDesc(entityType);
    }
    
    /**
     * Get activities by user
     */
    public List<SystemActivity> getActivitiesByUser(String userEmail) {
        return systemActivityRepository.findByPerformedByOrderByTimestampDesc(userEmail);
    }
    
    /**
     * Get login activities
     */
    public List<SystemActivity> getLoginActivities() {
        return systemActivityRepository.findLoginActivities();
    }
    
    /**
     * Get booking decision activities
     */
    public List<SystemActivity> getBookingDecisionActivities() {
        return systemActivityRepository.findBookingDecisionActivities();
    }
    
    /**
     * Get deletion activities
     */
    public List<SystemActivity> getDeletionActivities() {
        return systemActivityRepository.findDeletionActivities();
    }
    
    /**
     * Get failed activities
     */
    public List<SystemActivity> getFailedActivities() {
        return systemActivityRepository.findBySuccessFalseOrderByTimestampDesc();
    }
    
    /**
     * Search activities by description
     */
    public List<SystemActivity> searchActivities(String keyword) {
        return systemActivityRepository.searchByDescription(keyword);
    }
    
    /**
     * Get activity statistics for dashboard
     */
    public Map<String, Object> getActivityStatistics() {
        LocalDateTime since = LocalDateTime.now().minusDays(7); // Last 7 days
        Object[] stats = systemActivityRepository.getActivityStatistics(since);
        
        Map<String, Object> statistics = Map.of(
            "totalActivities", stats[0],
            "successfulActivities", stats[1],
            "failedActivities", stats[2],
            "uniqueUsers", stats[3]
        );
        
        return statistics;
    }
    
    /**
     * Get hourly activity count for charts
     */
    public Map<Integer, Long> getHourlyActivityCount() {
        LocalDateTime since = LocalDateTime.now().minusHours(24);
        List<Object[]> hourlyData = systemActivityRepository.getHourlyActivityCount(since);
        
        return hourlyData.stream()
            .collect(Collectors.toMap(
                data -> (Integer) data[0],
                data -> (Long) data[1]
            ));
    }
    
    /**
     * Get daily activity count for charts
     */
    public Map<String, Long> getDailyActivityCount() {
        LocalDateTime since = LocalDateTime.now().minusDays(30);
        List<Object[]> dailyData = systemActivityRepository.getDailyActivityCount(since);
        
        return dailyData.stream()
            .collect(Collectors.toMap(
                data -> data[0].toString(),
                data -> (Long) data[1]
            ));
    }
    
    /**
     * Get activity counts by action type
     */
    public Map<String, Long> getActivitiesByActionCount() {
        List<Object[]> actionData = systemActivityRepository.countActivitiesByAction();
        
        return actionData.stream()
            .collect(Collectors.toMap(
                data -> (String) data[0],
                data -> (Long) data[1]
            ));
    }
    
    /**
     * Get activity counts by entity type
     */
    public Map<String, Long> getActivitiesByEntityTypeCount() {
        List<Object[]> entityTypeData = systemActivityRepository.countActivitiesByEntityType();
        
        return entityTypeData.stream()
            .collect(Collectors.toMap(
                data -> (String) data[0],
                data -> (Long) data[1]
            ));
    }
    
    /**
     * Get activity counts by user
     */
    public Map<String, Long> getActivitiesByUserCount() {
        List<Object[]> userData = systemActivityRepository.countActivitiesByUser();
        
        return userData.stream()
            .collect(Collectors.toMap(
                data -> (String) data[0],
                data -> (Long) data[1]
            ));
    }
    
    /**
     * Get client IP address from request
     */
    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty() && !"unknown".equalsIgnoreCase(xForwardedFor)) {
            return xForwardedFor.split(",")[0].trim();
        }
        
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty() && !"unknown".equalsIgnoreCase(xRealIp)) {
            return xRealIp;
        }
        
        return request.getRemoteAddr();
    }
    
    /**
     * Convenience method for login tracking
     */
    public void trackLogin(String userEmail, String userRole, HttpServletRequest request, boolean success) {
        SystemActivity activity = SystemActivity.login(userEmail, userRole, null, null, success);
        logActivity(activity, request);
    }
    
    /**
     * Convenience method for logout tracking
     */
    public void trackLogout(String userEmail, String userRole, HttpServletRequest request) {
        SystemActivity activity = SystemActivity.logout(userEmail, userRole, null, null);
        logActivity(activity, request);
    }
    
    /**
     * Convenience method for booking decision tracking
     */
    public void trackBookingDecision(String bookingId, String bookingReference, 
                                   String performedBy, String performedByRole, 
                                   String decision, String reason) {
        SystemActivity activity = SystemActivity.bookingDecision(bookingId, bookingReference, 
                                                                performedBy, performedByRole, 
                                                                decision, reason);
        logActivity(activity);
    }
    
    /**
     * Convenience method for creation tracking
     */
    public void trackCreation(String entityType, String entityId, String entityName, 
                            String performedBy, String performedByRole, String description) {
        SystemActivity activity = SystemActivity.create(entityType, entityId, entityName, 
                                                         performedBy, performedByRole, description);
        logActivity(activity);
    }
    
    /**
     * Convenience method for update tracking
     */
    public void trackUpdate(String entityType, String entityId, String entityName, 
                           String performedBy, String performedByRole, String description,
                           String oldValue, String newValue) {
        SystemActivity activity = SystemActivity.update(entityType, entityId, entityName, 
                                                         performedBy, performedByRole, description,
                                                         oldValue, newValue);
        logActivity(activity);
    }
    
    /**
     * Convenience method for deletion tracking
     */
    public void trackDeletion(String entityType, String entityId, String entityName, 
                             String performedBy, String performedByRole, String description) {
        SystemActivity activity = SystemActivity.delete(entityType, entityId, entityName, 
                                                         performedBy, performedByRole, description);
        logActivity(activity);
    }
}
