package com.rugezi.marshland.service;

import com.rugezi.marshland.entity.Booking;
import com.rugezi.marshland.entity.BookingStatus;
import com.rugezi.marshland.entity.User;
import com.rugezi.marshland.entity.VisitDate;
import com.rugezi.marshland.repository.BookingRepository;
import com.rugezi.marshland.repository.UserRepository;
import com.rugezi.marshland.repository.VisitDateRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class BookingService {
    
    private final BookingRepository bookingRepository;
    private final VisitDateRepository visitDateRepository;
    private final UserRepository userRepository;
    
    public BookingService(BookingRepository bookingRepository, VisitDateRepository visitDateRepository, UserRepository userRepository) {
        this.bookingRepository = bookingRepository;
        this.visitDateRepository = visitDateRepository;
        this.userRepository = userRepository;
    }
    
    public Booking createBooking(Booking booking) {
        VisitDate visitDate = booking.getVisitDate();
        
        if (!visitDate.hasAvailableCapacity(booking.getNumberOfVisitors())) {
            throw new RuntimeException("Not enough capacity available for the selected date");
        }
        
        booking.setBookingStatus(BookingStatus.PENDING);
        
        return bookingRepository.save(booking);
    }
    
    @Transactional(propagation = org.springframework.transaction.annotation.Propagation.REQUIRES_NEW)
    public Booking approveBooking(Long bookingId, User admin) {
        System.out.println(">>> Approving booking ID: " + bookingId);
        try {
            Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found with id: " + bookingId));

            System.out.println(">>> Booking status: " + booking.getBookingStatus());
            if (booking.getBookingStatus() != BookingStatus.PENDING) {
                throw new RuntimeException("Booking is not in pending status");
            }

            // Use native SQL query to update status directly
            System.out.println(">>> Using native query to update booking status...");
            int updated = bookingRepository.updateBookingStatusToApprovedNative(bookingId, LocalDateTime.now());
            System.out.println(">>> Updated " + updated + " row(s)");

            // Refresh the booking to get the updated state
            bookingRepository.flush();
            Booking savedBooking = bookingRepository.findById(bookingId).get();
            System.out.println(">>> Booking approved successfully");

            return savedBooking;
        } catch (Exception e) {
            System.err.println(">>> Error in approveBooking: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to approve booking: " + e.getMessage(), e);
        }
    }
    
    public Booking rejectBooking(Long bookingId, User admin) {
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new RuntimeException("Booking not found with id: " + bookingId));
        
        if (booking.getBookingStatus() != BookingStatus.PENDING) {
            throw new RuntimeException("Booking is not in pending status");
        }
        
        booking.reject(admin);
        
        return bookingRepository.save(booking);
    }
    
    public Optional<Booking> findById(Long id) {
        return bookingRepository.findById(id);
    }
    
    public Booking getBookingById(Long id) {
        return bookingRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Booking not found with id: " + id));
    }
    
    public List<Booking> findAll() {
        return bookingRepository.findAll();
    }
    
    public List<Booking> findByUser(User user) {
        return bookingRepository.findByUser(user);
    }
    
    public List<Booking> findByStatus(BookingStatus status) {
        return bookingRepository.findByBookingStatus(status);
    }
    
    public List<Booking> findByDate(LocalDate date) {
        return bookingRepository.findByVisitDate(date);
    }
    
    public List<Booking> findByDateRange(LocalDate startDate, LocalDate endDate) {
        return bookingRepository.findByDateRange(startDate, endDate);
    }
    
    public List<Booking> findPendingBookings() {
        return bookingRepository.findByStatusAndFutureDate(BookingStatus.PENDING, LocalDate.now());
    }
    
    public List<Booking> findUpcomingApprovedBookings(User user) {
        return bookingRepository.findUpcomingApprovedBookings(user, LocalDate.now());
    }
    
    public long countApprovedBookingsByDate(LocalDate date) {
        return bookingRepository.countApprovedBookingsByDate(date);
    }
    
    public List<Booking> findBookingsByUser(Long userId) {
        return bookingRepository.findByUserId(userId);
    }
    
    public List<Booking> findPendingBookingsByUser(Long userId) {
        return bookingRepository.findByUserIdAndStatus(userId, BookingStatus.PENDING);
    }
    
    public List<Booking> findApprovedBookings() {
        return bookingRepository.findByBookingStatus(BookingStatus.APPROVED);
    }
    
    // RBAC specific methods
    public List<Booking> getBookingsByUser(User user) {
        return bookingRepository.findByUser(user);
    }
    
    public List<Booking> getUpcomingBookingsForUser(User user) {
        return bookingRepository.findUpcomingApprovedBookings(user, LocalDate.now());
    }
    
    public List<Booking> getPastBookingsForUser(User user) {
        return bookingRepository.findAll().stream()
                .filter(b -> b.getUser().getUserId().equals(user.getUserId()))
                .filter(b -> b.getVisitDate().getVisitDate().isBefore(LocalDate.now()))
                .toList();
    }
    
    public void cancelBooking(Long bookingId, User user) {
        Booking booking = getBookingById(bookingId);
        if (!booking.getUser().getUserId().equals(user.getUserId())) {
            throw new RuntimeException("You can only cancel your own bookings");
        }
        if (booking.getBookingStatus() == BookingStatus.CANCELLED) {
            throw new RuntimeException("Booking is already cancelled");
        }
        booking.setBookingStatus(BookingStatus.CANCELLED);
        bookingRepository.save(booking);
    }
    
    public List<Booking> getPendingBookings() {
        return bookingRepository.findByStatusAndFutureDate(BookingStatus.PENDING, LocalDate.now());
    }
    
    public long getPendingBookingsCount() {
        return bookingRepository.findByBookingStatus(BookingStatus.PENDING).size();
    }
    
    public List<Booking> getRecentBookings(int limit) {
        return bookingRepository.findAll().stream()
                .sorted((b1, b2) -> b2.getCreatedAt().compareTo(b1.getCreatedAt()))
                .limit(limit)
                .toList();
    }
    
    public long getTotalBookingsCount() {
        return bookingRepository.count();
    }
    
    public List<Booking> getBookingsByDate(LocalDate date) {
        return bookingRepository.findByVisitDate(date);
    }
    
    public List<Booking> getCheckedInBookings(LocalDate date) {
        return bookingRepository.findByVisitDate(date).stream()
                .filter(b -> b.getBookingStatus() == BookingStatus.CHECKED_IN)
                .toList();
    }
    
    public List<Booking> getPendingBookingsForDate(LocalDate date) {
        return bookingRepository.findByVisitDate(date).stream()
                .filter(b -> b.getBookingStatus() == BookingStatus.APPROVED)
                .toList();
    }
    
    public List<Booking> getBookingsThisWeek() {
        LocalDate today = LocalDate.now();
        LocalDate weekStart = today.minusDays(today.getDayOfWeek().getValue() - 1);
        LocalDate weekEnd = weekStart.plusDays(6);
        return bookingRepository.findByDateRange(weekStart, weekEnd);
    }
    
    public List<Booking> getRecentCheckins(int limit) {
        return bookingRepository.findAll().stream()
                .filter(b -> b.getBookingStatus() == BookingStatus.APPROVED)
                .sorted((b1, b2) -> b2.getCreatedAt().compareTo(b1.getCreatedAt()))
                .limit(limit)
                .toList();
    }
    
    public void checkInBooking(Long bookingId, User staff, String notes) {
        Booking booking = getBookingById(bookingId);
        booking.setBookingStatus(BookingStatus.CHECKED_IN);
        bookingRepository.save(booking);
    }
    
    public void checkOutBooking(Long bookingId, User staff, String notes) {
        Booking booking = getBookingById(bookingId);
        booking.setBookingStatus(BookingStatus.CHECKED_OUT);
        bookingRepository.save(booking);
    }
    
    public List<Booking> getCheckedOutBookings(LocalDate date) {
        return bookingRepository.findByVisitDate(date).stream()
                .filter(b -> b.getBookingStatus() == BookingStatus.CHECKED_OUT)
                .toList();
    }
    
    public List<Booking> getCancelledBookings(LocalDate date) {
        return bookingRepository.findByVisitDate(date).stream()
                .filter(b -> b.getBookingStatus() == BookingStatus.CANCELLED)
                .toList();
    }
    
    public List<Booking> getNoShows(LocalDate date) {
        return bookingRepository.findByVisitDate(date).stream()
                .filter(b -> b.getBookingStatus() == BookingStatus.CANCELLED)
                .toList();
    }
    
    public double getAverageDailyBookingsThisWeek() {
        List<Booking> weekBookings = getBookingsThisWeek();
        return weekBookings.size() / 7.0;
    }
    
    public void addVisitNote(Long bookingId, User staff, String note) {
        Booking booking = getBookingById(bookingId);
        // This would ideally be stored in a separate notes table
        bookingRepository.save(booking);
    }
    
    public User updateUserProfile(User user, Map<String, String> profileData) {
        // Update user profile fields
        if (profileData.containsKey("firstName")) {
            user.setFirstName(profileData.get("firstName"));
        }
        if (profileData.containsKey("lastName")) {
            user.setLastName(profileData.get("lastName"));
        }
        if (profileData.containsKey("phone")) {
            user.setPhone(profileData.get("phone"));
        }
        return user; // This would be saved by UserService
    }
    
    public List<VisitDate> getAvailableVisitDates() {
        return visitDateRepository.findAll().stream()
                .filter(vd -> vd.getDate().isAfter(LocalDate.now()) && vd.hasAvailableCapacity(1))
                .toList();
    }
    
    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }
    
    public Booking updateBooking(Booking booking, User updatedBy) {
        Booking existingBooking = getBookingById(booking.getBookingId());
        
        // Update allowed fields
        if (booking.getNumberOfVisitors() != null) {
            existingBooking.setNumberOfVisitors(booking.getNumberOfVisitors());
        }
        if (booking.getSpecialRequests() != null) {
            existingBooking.setSpecialRequests(booking.getSpecialRequests());
        }
        if (booking.getVisitDate() != null) {
            existingBooking.setVisitDate(booking.getVisitDate());
        }
        
        return bookingRepository.save(existingBooking);
    }
    
    public void deleteBooking(Long bookingId) {
        Booking booking = getBookingById(bookingId);
        bookingRepository.delete(booking);
    }
    
    public Map<String, Object> getBookingStatistics() {
        Map<String, Object> stats = new java.util.HashMap<>();
        stats.put("total", getTotalBookingsCount());
        stats.put("pending", getPendingBookingsCount());
        stats.put("approved", bookingRepository.findByBookingStatus(BookingStatus.APPROVED).size());
        stats.put("cancelled", bookingRepository.findByBookingStatus(BookingStatus.CANCELLED).size());
        stats.put("completed", bookingRepository.findByBookingStatus(BookingStatus.APPROVED).size());
        return stats;
    }
}
