package com.rugezi.marshland.repository;

import com.rugezi.marshland.entity.SystemActivity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SystemActivityRepository extends JpaRepository<SystemActivity, Long> {
    
    // Find all activities ordered by timestamp (most recent first)
    List<SystemActivity> findAllByOrderByTimestampDesc();
    
    // Find activities by action type
    List<SystemActivity> findByActionOrderByTimestampDesc(String action);
    
    // Find activities by entity type
    List<SystemActivity> findByEntityTypeOrderByTimestampDesc(String entityType);
    
    // Find activities by performed by user
    List<SystemActivity> findByPerformedByOrderByTimestampDesc(String performedBy);
    
    // Find activities in date range
    @Query("SELECT a FROM SystemActivity a WHERE a.timestamp BETWEEN :startDate AND :endDate ORDER BY a.timestamp DESC")
    List<SystemActivity> findByTimestampBetweenOrderByTimestampDesc(@Param("startDate") LocalDateTime startDate, 
                                                                   @Param("endDate") LocalDateTime endDate);
    
    // Find recent activities (last N hours/days)
    @Query("SELECT a FROM SystemActivity a WHERE a.timestamp >= :since ORDER BY a.timestamp DESC")
    List<SystemActivity> findRecentActivities(@Param("since") LocalDateTime since);
    
    // Find activities by action and entity type
    List<SystemActivity> findByActionAndEntityTypeOrderByTimestampDesc(String action, String entityType);
    
    // Find failed activities
    List<SystemActivity> findBySuccessFalseOrderByTimestampDesc();
    
    // Count activities by action type
    @Query("SELECT a.action, COUNT(a) FROM SystemActivity a GROUP BY a.action")
    List<Object[]> countActivitiesByAction();
    
    // Count activities by entity type
    @Query("SELECT a.entityType, COUNT(a) FROM SystemActivity a GROUP BY a.entityType")
    List<Object[]> countActivitiesByEntityType();
    
    // Count activities by user
    @Query("SELECT a.performedBy, COUNT(a) FROM SystemActivity a GROUP BY a.performedBy")
    List<Object[]> countActivitiesByUser();
    
    // Get activity statistics for dashboard
    @Query("SELECT " +
           "COUNT(a) as totalActivities, " +
           "SUM(CASE WHEN a.success = true THEN 1 ELSE 0 END) as successfulActivities, " +
           "SUM(CASE WHEN a.success = false THEN 1 ELSE 0 END) as failedActivities, " +
           "COUNT(DISTINCT a.performedBy) as uniqueUsers " +
           "FROM SystemActivity a WHERE a.timestamp >= :since")
    Object[] getActivityStatistics(@Param("since") LocalDateTime since);
    
    // Get hourly activity count for the last 24 hours
    @Query("SELECT " +
           "FUNCTION('HOUR', a.timestamp) as hour, " +
           "COUNT(a) as count " +
           "FROM SystemActivity a " +
           "WHERE a.timestamp >= :since " +
           "GROUP BY FUNCTION('HOUR', a.timestamp) " +
           "ORDER BY hour")
    List<Object[]> getHourlyActivityCount(@Param("since") LocalDateTime since);
    
    // Get daily activity count for the last 30 days
    @Query("SELECT " +
           "FUNCTION('DATE', a.timestamp) as date, " +
           "COUNT(a) as count " +
           "FROM SystemActivity a " +
           "WHERE a.timestamp >= :since " +
           "GROUP BY FUNCTION('DATE', a.timestamp) " +
           "ORDER BY date")
    List<Object[]> getDailyActivityCount(@Param("since") LocalDateTime since);
    
    // Find login activities (successful and failed)
    @Query("SELECT a FROM SystemActivity a WHERE a.action = 'LOGIN' ORDER BY a.timestamp DESC")
    List<SystemActivity> findLoginActivities();
    
    // Find booking decision activities
    @Query("SELECT a FROM SystemActivity a WHERE a.action IN ('APPROVE', 'REJECT') AND a.entityType = 'BOOKING' ORDER BY a.timestamp DESC")
    List<SystemActivity> findBookingDecisionActivities();
    
    // Find deletion activities
    @Query("SELECT a FROM SystemActivity a WHERE a.action = 'DELETE' ORDER BY a.timestamp DESC")
    List<SystemActivity> findDeletionActivities();
    
    // Search activities by description
    @Query("SELECT a FROM SystemActivity a WHERE a.description LIKE %:keyword% ORDER BY a.timestamp DESC")
    List<SystemActivity> searchByDescription(@Param("keyword") String keyword);
    
    // Get activities with pagination
    @Query("SELECT a FROM SystemActivity a ORDER BY a.timestamp DESC")
    List<SystemActivity> findRecentActivitiesWithPagination();
}
