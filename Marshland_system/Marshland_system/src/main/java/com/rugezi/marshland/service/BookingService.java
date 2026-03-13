package com.rugezi.marshland.service;

import com.rugezi.marshland.entity.Booking;
import com.rugezi.marshland.entity.BookingStatus;
import com.rugezi.marshland.entity.User;
import com.rugezi.marshland.entity.VisitDate;
import com.rugezi.marshland.repository.BookingRepository;
import com.rugezi.marshland.repository.VisitDateRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class BookingService {
    
    private final BookingRepository bookingRepository;
    private final VisitDateRepository visitDateRepository;
    
    public BookingService(BookingRepository bookingRepository, VisitDateRepository visitDateRepository) {
        this.bookingRepository = bookingRepository;
        this.visitDateRepository = visitDateRepository;
    }
    
    public Booking createBooking(Booking booking) {
        VisitDate visitDate = booking.getVisitDate();
        
        if (!visitDate.hasAvailableCapacity(booking.getNumberOfVisitors())) {
            throw new RuntimeException("Not enough capacity available for the selected date");
        }
        
        booking.setBookingStatus(BookingStatus.PENDING);
        
        return bookingRepository.save(booking);
    }
    
    public Booking approveBooking(Long bookingId, User admin) {
        Booking booking = getBookingById(bookingId);
        
        if (booking.getBookingStatus() != BookingStatus.PENDING) {
            throw new RuntimeException("Booking is not in pending status");
        }
        
        VisitDate visitDate = booking.getVisitDate();
        
        if (!visitDate.hasAvailableCapacity(booking.getNumberOfVisitors())) {
            throw new RuntimeException("Not enough capacity available for approval");
        }
        
        booking.approve(admin);
        visitDate.setCurrentBookings(visitDate.getCurrentBookings() + booking.getNumberOfVisitors());
        visitDateRepository.save(visitDate);
        
        return bookingRepository.save(booking);
    }
    
    public Booking rejectBooking(Long bookingId, User admin) {
        Booking booking = getBookingById(bookingId);
        
        if (booking.getBookingStatus() != BookingStatus.PENDING) {
            throw new RuntimeException("Booking is not in pending status");
        }
        
        booking.reject(admin);
        
        return bookingRepository.save(booking);
    }
    
    public void cancelBooking(Long bookingId, User user) {
        Booking booking = getBookingById(bookingId);
        
        if (!booking.getUser().getUserId().equals(user.getUserId())) {
            throw new RuntimeException("You can only cancel your own bookings");
        }
        
        if (booking.getBookingStatus() == BookingStatus.APPROVED) {
            VisitDate visitDate = booking.getVisitDate();
            visitDate.setCurrentBookings(visitDate.getCurrentBookings() - booking.getNumberOfVisitors());
            visitDateRepository.save(visitDate);
        }
        
        bookingRepository.delete(booking);
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
}
