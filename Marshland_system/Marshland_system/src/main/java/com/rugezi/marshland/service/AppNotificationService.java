package com.rugezi.marshland.service;

import com.rugezi.marshland.entity.Notification;
import com.rugezi.marshland.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AppNotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    // Create a new notification
    public Notification createNotification(Long userId, String title, String message, String type, String link) {
        Notification notification = new Notification();
        notification.setUserId(userId);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type);
        notification.setLink(link);
        notification.setIsRead(false);
        notification.setCreatedAt(LocalDateTime.now());
        return notificationRepository.save(notification);
    }

    // Create notification without link
    public Notification createNotification(Long userId, String title, String message, String type) {
        return createNotification(userId, title, message, type, null);
    }

    // Get all notifications for a user
    public List<Notification> getUserNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    // Get unread notifications for a user
    public List<Notification> getUnreadNotifications(Long userId) {
        return notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);
    }

    // Count unread notifications for a user
    public Long countUnreadNotifications(Long userId) {
        return notificationRepository.countUnreadByUserId(userId);
    }

    // Mark a specific notification as read
    @Transactional
    public Notification markAsRead(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId)
            .orElseThrow(() -> new RuntimeException("Notification not found"));
        
        // Verify the notification belongs to the user
        if (!notification.getUserId().equals(userId)) {
            throw new RuntimeException("You can only mark your own notifications as read");
        }
        
        notification.setIsRead(true);
        notification.setReadAt(LocalDateTime.now());
        return notificationRepository.save(notification);
    }

    // Mark all notifications as read for a user
    @Transactional
    public void markAllAsReadForUser(Long userId) {
        notificationRepository.markAllAsReadByUserId(userId);
    }

    // Delete a notification
    public void deleteNotification(Long notificationId) {
        notificationRepository.deleteById(notificationId);
    }

    // Delete old read notifications (cleanup)
    @Transactional
    public void cleanupOldNotifications(int daysOld) {
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(daysOld);
        notificationRepository.deleteOldReadNotifications(cutoffDate);
    }

    // Get notifications by type for a user
    public List<Notification> getUserNotificationsByType(Long userId, String type) {
        return notificationRepository.findByUserIdAndTypeOrderByCreatedAtDesc(userId, type);
    }

    // Send notification to multiple users (e.g., all staff)
    public void sendNotificationToMultipleUsers(List<Long> userIds, String title, String message, String type, String link) {
        for (Long userId : userIds) {
            createNotification(userId, title, message, type, link);
        }
    }

    // Send notification to multiple users without link
    public void sendNotificationToMultipleUsers(List<Long> userIds, String title, String message, String type) {
        sendNotificationToMultipleUsers(userIds, title, message, type, null);
    }

    // Get all notifications (for admin)
    public List<Notification> getAllNotifications() {
        return notificationRepository.findAllByOrderByCreatedAtDesc();
    }

    // Find notification by ID
    public Notification findById(Long notificationId) {
        return notificationRepository.findById(notificationId)
            .orElseThrow(() -> new RuntimeException("Notification not found"));
    }

    // Update notification
    public Notification updateNotification(Notification notification) {
        return notificationRepository.save(notification);
    }
}
