package com.rugezi.marshland.service.filtering;

import com.rugezi.marshland.entity.Booking;
import com.rugezi.marshland.entity.BookingStatus;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class BookingStatistics {
    
    private final int totalBookings;
    private final int pendingBookings;
    private final int approvedBookings;
    private final int rejectedBookings;
    private final int cancelledBookings;
    private final int totalVisitors;
    private final double averageVisitorsPerBooking;
    private final Map<BookingStatus, Long> statusCounts;
    private final List<Booking> bookings;
    
    public BookingStatistics(List<Booking> bookings) {
        this.bookings = bookings;
        this.totalBookings = bookings.size();
        
        this.statusCounts = bookings.stream()
            .collect(Collectors.groupingBy(Booking::getBookingStatus, Collectors.counting()));
        
        this.pendingBookings = statusCounts.getOrDefault(BookingStatus.PENDING, 0L).intValue();
        this.approvedBookings = statusCounts.getOrDefault(BookingStatus.APPROVED, 0L).intValue();
        this.rejectedBookings = statusCounts.getOrDefault(BookingStatus.REJECTED, 0L).intValue();
        this.cancelledBookings = 0; // No CANCELLED status in current enum
        
        this.totalVisitors = bookings.stream()
            .mapToInt(Booking::getNumberOfVisitors)
            .sum();
        
        this.averageVisitorsPerBooking = totalBookings > 0 ? 
            (double) totalVisitors / totalBookings : 0.0;
    }
    
    // Getters
    public int getTotalBookings() { return totalBookings; }
    public int getPendingBookings() { return pendingBookings; }
    public int getApprovedBookings() { return approvedBookings; }
    public int getRejectedBookings() { return rejectedBookings; }
    public int getCancelledBookings() { return cancelledBookings; }
    public int getTotalVisitors() { return totalVisitors; }
    public double getAverageVisitorsPerBooking() { return averageVisitorsPerBooking; }
    public Map<BookingStatus, Long> getStatusCounts() { return statusCounts; }
    public List<Booking> getBookings() { return bookings; }
    
    /**
     * Get approval rate percentage
     */
    public double getApprovalRate() {
        int processedBookings = approvedBookings + rejectedBookings;
        return processedBookings > 0 ? 
            (double) approvedBookings / processedBookings * 100 : 0.0;
    }
    
    /**
     * Get cancellation rate percentage
     */
    public double getCancellationRate() {
        return totalBookings > 0 ? 
            (double) cancelledBookings / totalBookings * 100 : 0.0;
    }
    
    @Override
    public String toString() {
        return String.format(
            "BookingStatistics{total=%d, pending=%d, approved=%d, rejected=%d, cancelled=%d, " +
            "totalVisitors=%d, avgVisitors=%.2f, approvalRate=%.2f%%, cancellationRate=%.2f%%}",
            totalBookings, pendingBookings, approvedBookings, rejectedBookings, 
            cancelledBookings, totalVisitors, averageVisitorsPerBooking, 
            getApprovalRate(), getCancellationRate()
        );
    }
}
