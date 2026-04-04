package com.rugezi.marshland.service.workflow;

import com.rugezi.marshland.entity.Booking;
import com.rugezi.marshland.entity.BookingStatus;
import com.rugezi.marshland.entity.User;
import com.rugezi.marshland.entity.VisitDate;
import com.rugezi.marshland.repository.BookingRepository;
import com.rugezi.marshland.service.BookingService;
import com.rugezi.marshland.service.filtering.BookingFilterService;
import com.rugezi.marshland.service.notification.NotificationService;
import com.rugezi.marshland.validator.BusinessRuleValidator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.logging.Logger;

@Service
@Transactional
public class BookingWorkflowService {
    
    private static final Logger logger = Logger.getLogger(BookingWorkflowService.class.getName());
    
    @Autowired
    private BookingRepository bookingRepository;
    
    @Autowired
    private BookingService bookingService;
    
    @Autowired
    private BusinessRuleValidator businessRuleValidator;
    
    @Autowired
    private BookingFilterService bookingFilterService;
    
    @Autowired
    private NotificationService notificationService;
    
    /**
     * Automated approval workflow for bookings that meet criteria
     */
    @Scheduled(cron = "0 0 */2 * * ?") // Every 2 hours
    public void processAutomaticApprovals() {
        logger.info("Starting automatic approval workflow");
        
        List<Booking> pendingBookings = bookingRepository.findByBookingStatus(BookingStatus.PENDING);
        int approvedCount = 0;
        int rejectedCount = 0;
        
        for (Booking booking : pendingBookings) {
            try {
                if (shouldAutoApprove(booking)) {
                    processAutoApproval(booking);
                    approvedCount++;
                } else if (shouldAutoReject(booking)) {
                    processAutoRejection(booking);
                    rejectedCount++;
                }
            } catch (Exception e) {
                logger.severe("Error processing booking " + booking.getBookingId() + ": " + e.getMessage());
            }
        }
        
        logger.info(String.format("Automatic approval completed: %d approved, %d rejected", approvedCount, rejectedCount));
    }
    
    /**
     * Send reminders for upcoming visits
     */
    @Scheduled(cron = "0 0 9 * * ?") // Daily at 9 AM
    public void sendVisitReminders() {
        logger.info("Sending visit reminders");
        
        List<Booking> upcomingBookings = bookingFilterService.getUpcomingBookings(7); // Next 7 days
        
        for (Booking booking : upcomingBookings) {
            try {
                notificationService.sendVisitReminder(booking);
            } catch (Exception e) {
                logger.severe("Error sending reminder for booking " + booking.getBookingId() + ": " + e.getMessage());
            }
        }
        
        logger.info("Sent " + upcomingBookings.size() + " visit reminders");
    }
    
    /**
     * Clean up old bookings (archive or delete very old records)
     */
    @Scheduled(cron = "0 0 2 1 * ?") // 1st of every month at 2 AM
    public void cleanupOldBookings() {
        logger.info("Starting cleanup of old bookings");
        
        LocalDate cutoffDate = LocalDate.now().minusYears(2); // 2 years ago
        List<Booking> oldBookings = bookingRepository.findByStatusAndFutureDate(
            BookingStatus.APPROVED, cutoffDate);
        
        // For now, just log. In production, you might archive these
        logger.info("Found " + oldBookings.size() + " bookings older than 2 years");
        
        // Could implement archiving logic here
        // archiveBookings(oldBookings);
    }
    
    /**
     * Determine if a booking should be automatically approved
     */
    private boolean shouldAutoApprove(Booking booking) {
        // Rule 1: Small groups (1-5 visitors) get auto-approved
        if (booking.getNumberOfVisitors() <= 5) {
            return true;
        }
        
        // Rule 2: Bookings made well in advance (30+ days) get auto-approved
        long daysUntilVisit = LocalDate.now().until(booking.getVisitDate().getVisitDate()).getDays();
        if (daysUntilVisit >= 30) {
            return true;
        }
        
        // Rule 3: Off-peak dates get auto-approved
        if (isOffPeakDate(booking.getVisitDate().getVisitDate())) {
            return true;
        }
        
        return false;
    }
    
    /**
     * Determine if a booking should be automatically rejected
     */
    private boolean shouldAutoReject(Booking booking) {
        // Rule 1: Visit date is in the past
        if (booking.getVisitDate().getVisitDate().isBefore(LocalDate.now())) {
            return true;
        }
        
        // Rule 2: No available capacity
        if (!booking.getVisitDate().hasAvailableCapacity(booking.getNumberOfVisitors())) {
            return true;
        }
        
        // Rule 3: Too many visitors for single booking
        if (booking.getNumberOfVisitors() > 15) {
            return true;
        }
        
        return false;
    }
    
    /**
     * Process automatic approval
     */
    private void processAutoApproval(Booking booking) {
        // Validate business rules before approval
        BusinessRuleValidator.ValidationResult validation = 
            businessRuleValidator.validateBookingApproval(booking, getSystemUser());
        
        if (!validation.isValid()) {
            logger.warning("Cannot auto-approve booking " + booking.getBookingId() + 
                ": " + validation.getMessage());
            return;
        }
        
        booking.approve(getSystemUser());
        bookingRepository.save(booking);
        
        // Update visit date capacity
        booking.getVisitDate().setCurrentBookings(
            booking.getVisitDate().getCurrentBookings() + booking.getNumberOfVisitors());
        
        // Send notification
        notificationService.sendBookingApprovedNotification(booking);
        
        logger.info("Auto-approved booking: " + booking.getBookingId());
    }
    
    /**
     * Process automatic rejection
     */
    private void processAutoRejection(Booking booking) {
        booking.reject(getSystemUser());
        bookingRepository.save(booking);
        
        // Send notification
        notificationService.sendBookingRejectedNotification(booking);
        
        logger.info("Auto-rejected booking: " + booking.getBookingId());
    }
    
    /**
     * Check if a date is considered off-peak
     */
    private boolean isOffPeakDate(LocalDate date) {
        // Weekdays are off-peak (Monday-Friday)
        return date.getDayOfWeek().getValue() <= 5;
    }
    
    /**
     * Get a system user for automated actions
     */
    private User getSystemUser() {
        // This should return a system user or admin user
        // For now, return null and handle in service layer
        return null;
    }
    
    /**
     * Manual workflow step: Submit booking for approval
     */
    public Booking submitForApproval(Booking booking) {
        // Validate booking creation rules
        BusinessRuleValidator.ValidationResult validation = 
            businessRuleValidator.validateBookingCreation(
                booking, booking.getVisitDate(), booking.getUser());
        
        if (!validation.isValid()) {
            throw new IllegalArgumentException(validation.getMessage());
        }
        
        booking.setBookingStatus(BookingStatus.PENDING);
        booking.setBookingDate(LocalDateTime.now());
        
        Booking savedBooking = bookingRepository.save(booking);
        
        // Send notification to staff
        notificationService.sendNewBookingNotification(savedBooking);
        
        logger.info("Booking submitted for approval: " + savedBooking.getBookingId());
        return savedBooking;
    }
    
    /**
     * Manual workflow step: Approve booking
     */
    public Booking approveBooking(Long bookingId, User approver) {
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new RuntimeException("Booking not found: " + bookingId));
        
        // Validate approval rules
        BusinessRuleValidator.ValidationResult validation = 
            businessRuleValidator.validateBookingApproval(booking, approver);
        
        if (!validation.isValid()) {
            throw new IllegalArgumentException(validation.getMessage());
        }
        
        booking.approve(approver);
        Booking approvedBooking = bookingRepository.save(booking);
        
        // Update capacity
        booking.getVisitDate().setCurrentBookings(
            booking.getVisitDate().getCurrentBookings() + booking.getNumberOfVisitors());
        
        // Send notifications
        notificationService.sendBookingApprovedNotification(approvedBooking);
        
        logger.info("Booking approved: " + bookingId + " by " + approver.getEmail());
        return approvedBooking;
    }
    
    /**
     * Manual workflow step: Reject booking
     */
    public Booking rejectBooking(Long bookingId, User approver) {
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new RuntimeException("Booking not found: " + bookingId));
        
        booking.reject(approver);
        Booking rejectedBooking = bookingRepository.save(booking);
        
        // Send notifications
        notificationService.sendBookingRejectedNotification(rejectedBooking);
        
        logger.info("Booking rejected: " + bookingId + " by " + approver.getEmail());
        return rejectedBooking;
    }
}
