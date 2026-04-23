package com.rugezi.marshland.repository;

import com.rugezi.marshland.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    
    // Find all notifications for a specific user, ordered by creation date (newest first)
    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    // Find unread notifications for a specific user
    List<Notification> findByUserIdAndIsReadFalseOrderByCreatedAtDesc(Long userId);
    
    // Count unread notifications for a specific user
    @Query("SELECT COUNT(n) FROM Notification n WHERE n.userId = :userId AND n.isRead = false")
    Long countUnreadByUserId(@Param("userId") Long userId);
    
    // Find notifications by type for a specific user
    List<Notification> findByUserIdAndTypeOrderByCreatedAtDesc(Long userId, String type);
    
    // Mark all notifications as read for a specific user
    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true, n.readAt = CURRENT_TIMESTAMP WHERE n.userId = :userId AND n.isRead = false")
    void markAllAsReadByUserId(@Param("userId") Long userId);
    
    // Find notifications created after a certain date for a specific user
    List<Notification> findByUserIdAndCreatedAtAfterOrderByCreatedAtDesc(Long userId, java.time.LocalDateTime date);
    
    // Delete notifications older than a certain date
    @Modifying
    @Query("DELETE FROM Notification n WHERE n.createdAt < :date AND n.isRead = true")
    void deleteOldReadNotifications(@Param("date") java.time.LocalDateTime date);

    // Find all notifications ordered by creation date (for admin)
    @Query("SELECT n FROM Notification n ORDER BY n.createdAt DESC")
    List<Notification> findAllByOrderByCreatedAtDesc();
}
