package com.rugezi.marshland.service.notification;

import com.rugezi.marshland.entity.Booking;
import com.rugezi.marshland.entity.User;
import com.rugezi.marshland.entity.UserRole;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.logging.Logger;

@Service
public class NotificationService {
    
    private static final Logger logger = Logger.getLogger(NotificationService.class.getName());
    
    @Autowired(required = false)
    private JavaMailSender mailSender;
    
    /**
     * Send notification when a new booking is created
     */
    public void sendNewBookingNotification(Booking booking) {
        String subject = "New Booking Request - " + booking.getBookingId();
        String message = buildNewBookingMessage(booking);
        
        // Send to staff/admin users
        sendNotificationToRole(UserRole.STAFF, subject, message);
        sendNotificationToRole(UserRole.ADMIN, subject, message);
        
        // Send confirmation to user
        sendBookingConfirmation(booking);
        
        logger.info("New booking notification sent for booking: " + booking.getBookingId());
    }
    
    /**
     * Send notification when booking is approved
     */
    public void sendBookingApprovedNotification(Booking booking) {
        String subject = "Booking Approved - " + booking.getBookingId();
        String message = buildApprovalMessage(booking);
        
        sendEmail(booking.getUser().getEmail(), subject, message);
        
        logger.info("Approval notification sent for booking: " + booking.getBookingId());
    }
    
    /**
     * Send notification when booking is rejected
     */
    public void sendBookingRejectedNotification(Booking booking) {
        String subject = "Booking Rejected - " + booking.getBookingId();
        String message = buildRejectionMessage(booking);
        
        sendEmail(booking.getUser().getEmail(), subject, message);
        
        logger.info("Rejection notification sent for booking: " + booking.getBookingId());
    }
    
    /**
     * Send visit reminder
     */
    public void sendVisitReminder(Booking booking) {
        String subject = "Visit Reminder - " + booking.getVisitDate().getVisitDate();
        String message = buildReminderMessage(booking);
        
        sendEmail(booking.getUser().getEmail(), subject, message);
        
        logger.info("Reminder sent for booking: " + booking.getBookingId());
    }
    
    /**
     * Send booking confirmation
     */
    private void sendBookingConfirmation(Booking booking) {
        String subject = "Booking Confirmation - " + booking.getBookingId();
        String message = buildConfirmationMessage(booking);
        
        sendEmail(booking.getUser().getEmail(), subject, message);
    }
    
    /**
     * Send notification to all users with a specific role
     */
    private void sendNotificationToRole(UserRole role, String subject, String message) {
        // This would require a method to find users by role
        // For now, log the notification
        logger.info("Notification sent to " + role + " users: " + subject);
        
        // In a real implementation:
        // List<User> users = userService.findByRole(role);
        // for (User user : users) {
        //     sendEmail(user.getEmail(), subject, message);
        // }
    }
    
    /**
     * Send email
     */
    private void sendEmail(String to, String subject, String message) {
        if (mailSender == null) {
            logger.info("Email service not configured. Would send to: " + to + 
                " Subject: " + subject + " Message: " + message);
            return;
        }
        
        try {
            SimpleMailMessage emailMessage = new SimpleMailMessage();
            emailMessage.setTo(to);
            emailMessage.setSubject(subject);
            emailMessage.setText(message);
            emailMessage.setFrom("noreply@marshland.com");
            
            mailSender.send(emailMessage);
        } catch (Exception e) {
            logger.severe("Failed to send email to " + to + ": " + e.getMessage());
        }
    }
    
    // Message building methods
    
    private String buildNewBookingMessage(Booking booking) {
        return String.format(
            "A new booking has been submitted:\n\n" +
            "Booking ID: %d\n" +
            "User: %s\n" +
            "Visit Date: %s\n" +
            "Number of Visitors: %d\n" +
            "Special Requests: %s\n\n" +
            "Please review and approve/reject this booking.",
            booking.getBookingId(),
            booking.getUser().getEmail(),
            booking.getVisitDate().getVisitDate().format(DateTimeFormatter.ofPattern("yyyy-MM-dd")),
            booking.getNumberOfVisitors(),
            booking.getSpecialRequests() != null ? booking.getSpecialRequests() : "None"
        );
    }
    
    private String buildApprovalMessage(Booking booking) {
        return String.format(
            "Your booking has been approved!\n\n" +
            "Booking ID: %d\n" +
            "Visit Date: %s\n" +
            "Number of Visitors: %d\n" +
            "Approved by: %s\n" +
            "Approval Date: %s\n\n" +
            "Please arrive 15 minutes before your scheduled visit.\n" +
            "Don't forget to bring valid identification.\n\n" +
            "We look forward to your visit!",
            booking.getBookingId(),
            booking.getVisitDate().getVisitDate().format(DateTimeFormatter.ofPattern("yyyy-MM-dd")),
            booking.getNumberOfVisitors(),
            booking.getApprovedBy() != null ? booking.getApprovedBy().getEmail() : "System",
            booking.getApprovalDate() != null ? 
                booking.getApprovalDate().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")) : "N/A"
        );
    }
    
    private String buildRejectionMessage(Booking booking) {
        return String.format(
            "Your booking has been rejected.\n\n" +
            "Booking ID: %d\n" +
            "Visit Date: %s\n" +
            "Number of Visitors: %d\n" +
            "Rejected by: %s\n" +
            "Rejection Date: %s\n\n" +
            "If you have questions about this decision, please contact our support team.\n" +
            "You can submit a new booking for a different date if desired.",
            booking.getBookingId(),
            booking.getVisitDate().getVisitDate().format(DateTimeFormatter.ofPattern("yyyy-MM-dd")),
            booking.getNumberOfVisitors(),
            booking.getApprovedBy() != null ? booking.getApprovedBy().getEmail() : "System",
            booking.getApprovalDate() != null ? 
                booking.getApprovalDate().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")) : "N/A"
        );
    }
    
    private String buildReminderMessage(Booking booking) {
        return String.format(
            "Visit Reminder - Your booking is coming up!\n\n" +
            "Booking ID: %d\n" +
            "Visit Date: %s\n" +
            "Number of Visitors: %d\n\n" +
            "Important reminders:\n" +
            "- Please arrive 15 minutes before your scheduled time\n" +
            "- Bring valid identification for all visitors\n" +
            "- Wear appropriate clothing for outdoor activities\n" +
            "- Follow all safety guidelines during your visit\n\n" +
            "If you need to cancel or modify your booking, please contact us as soon as possible.\n\n" +
            "We look forward to your visit!",
            booking.getBookingId(),
            booking.getVisitDate().getVisitDate().format(DateTimeFormatter.ofPattern("yyyy-MM-dd")),
            booking.getNumberOfVisitors()
        );
    }
    
    private String buildConfirmationMessage(Booking booking) {
        return String.format(
            "Thank you for your booking request!\n\n" +
            "Booking ID: %d\n" +
            "Visit Date: %s\n" +
            "Number of Visitors: %d\n" +
            "Special Requests: %s\n\n" +
            "Your booking is currently pending approval.\n" +
            "You will receive an email notification once a decision has been made.\n\n" +
            "Current Status: PENDING\n\n" +
            "For reference, please save this booking ID: %d",
            booking.getBookingId(),
            booking.getVisitDate().getVisitDate().format(DateTimeFormatter.ofPattern("yyyy-MM-dd")),
            booking.getNumberOfVisitors(),
            booking.getSpecialRequests() != null ? booking.getSpecialRequests() : "None",
            booking.getBookingId()
        );
    }
    
    /**
     * Send system notification (for logging and monitoring)
     */
    public void sendSystemNotification(String message) {
        logger.info("SYSTEM NOTIFICATION: " + message);
        
        // In production, this could send to:
        // - Slack channel
        // - Microsoft Teams
        // - Monitoring system
        // - Admin dashboard
    }
}
