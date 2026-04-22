package com.rugezi.marshland.controller;

import com.rugezi.marshland.entity.Notification;
import com.rugezi.marshland.entity.User;
import com.rugezi.marshland.service.AppNotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*", maxAge = 3600)
@PreAuthorize("isAuthenticated()")
public class NotificationController {

    @Autowired
    private AppNotificationService notificationService;
    
    // Get all notifications for the current user
    @GetMapping
    public ResponseEntity<?> getUserNotifications(Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();
            List<Notification> notifications = notificationService.getUserNotifications(user.getUserId());
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    // Get unread notifications for the current user
    @GetMapping("/unread")
    public ResponseEntity<?> getUnreadNotifications(Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();
            List<Notification> notifications = notificationService.getUnreadNotifications(user.getUserId());
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    // Get unread count for the current user
    @GetMapping("/unread/count")
    public ResponseEntity<?> getUnreadCount(Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();
            Long count = notificationService.countUnreadNotifications(user.getUserId());
            return ResponseEntity.ok(Map.of("count", count));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    // Mark a specific notification as read
    @PutMapping("/{notificationId}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Object notificationId, Authentication authentication) {
        try {
            Long id = notificationId instanceof Integer ? ((Integer) notificationId).longValue() : (Long) notificationId;
            User user = (User) authentication.getPrincipal();
            Notification notification = notificationService.markAsRead(id, user.getUserId());
            return ResponseEntity.ok(notification);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    // Mark all notifications as read for the current user
    @PutMapping("/read-all")
    public ResponseEntity<?> markAllAsRead(Authentication authentication) {
        try {
            if (authentication == null || authentication.getPrincipal() == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "User not authenticated"));
            }
            User user = (User) authentication.getPrincipal();
            if (user.getUserId() == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "User ID is null"));
            }
            notificationService.markAllAsReadForUser(user.getUserId());
            return ResponseEntity.ok(Map.of("message", "All notifications marked as read"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    // Delete a notification
    @DeleteMapping("/{notificationId}")
    public ResponseEntity<?> deleteNotification(@PathVariable Long notificationId, Authentication authentication) {
        try {
            notificationService.deleteNotification(notificationId);
            return ResponseEntity.ok(Map.of("message", "Notification deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    // Get notifications by type
    @GetMapping("/type/{type}")
    public ResponseEntity<?> getNotificationsByType(@PathVariable String type, Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();
            List<Notification> notifications = notificationService.getUserNotificationsByType(user.getUserId(), type);
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    // Create a notification (for internal use by other controllers)
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createNotification(@RequestBody Map<String, Object> notificationData) {
        try {
            Long userId = Long.valueOf(notificationData.get("userId").toString());
            String title = (String) notificationData.get("title");
            String message = (String) notificationData.get("message");
            String type = (String) notificationData.get("type");
            String link = notificationData.containsKey("link") ? (String) notificationData.get("link") : null;

            Notification notification = notificationService.createNotification(userId, title, message, type, link);
            return ResponseEntity.ok(notification);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Send notification to multiple users
    @PostMapping("/broadcast")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> broadcastNotification(@RequestBody Map<String, Object> notificationData) {
        try {
            @SuppressWarnings("unchecked")
            List<Integer> userIdsInt = (List<Integer>) notificationData.get("userIds");
            List<Long> userIds = userIdsInt.stream().map(Integer::longValue).collect(java.util.stream.Collectors.toList());
            String title = (String) notificationData.get("title");
            String message = (String) notificationData.get("message");
            String type = (String) notificationData.get("type");
            String link = notificationData.containsKey("link") ? (String) notificationData.get("link") : null;

            notificationService.sendNotificationToMultipleUsers(userIds, title, message, type, link);
            return ResponseEntity.ok(Map.of("message", "Notification sent to " + userIds.size() + " users"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Admin: Get all notifications in the system
    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllNotifications() {
        try {
            List<Notification> allNotifications = notificationService.getAllNotifications();
            return ResponseEntity.ok(allNotifications);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Admin: Update any notification
    @PutMapping("/admin/{notificationId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> adminUpdateNotification(@PathVariable Long notificationId, @RequestBody Map<String, Object> notificationData) {
        try {
            Notification notification = notificationService.findById(notificationId);
            if (notificationData.containsKey("title")) {
                notification.setTitle((String) notificationData.get("title"));
            }
            if (notificationData.containsKey("message")) {
                notification.setMessage((String) notificationData.get("message"));
            }
            if (notificationData.containsKey("type")) {
                notification.setType((String) notificationData.get("type"));
            }
            if (notificationData.containsKey("link")) {
                notification.setLink((String) notificationData.get("link"));
            }
            if (notificationData.containsKey("userId")) {
                notification.setUserId(Long.valueOf(notificationData.get("userId").toString()));
            }
            Notification updated = notificationService.updateNotification(notification);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Admin: Delete any notification
    @DeleteMapping("/admin/{notificationId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> adminDeleteNotification(@PathVariable Long notificationId) {
        try {
            notificationService.deleteNotification(notificationId);
            return ResponseEntity.ok(Map.of("message", "Notification deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
