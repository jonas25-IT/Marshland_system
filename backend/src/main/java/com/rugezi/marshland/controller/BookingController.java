package com.rugezi.marshland.controller;

import com.rugezi.marshland.entity.Booking;
import com.rugezi.marshland.entity.User;
import com.rugezi.marshland.entity.VisitDate;
import com.rugezi.marshland.service.BookingService;
import com.rugezi.marshland.service.UserService;
import com.rugezi.marshland.service.VisitDateService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/booking")
public class BookingController {
    
    private final BookingService bookingService;
    private final VisitDateService visitDateService;
    private final UserService userService;
    
    public BookingController(BookingService bookingService, VisitDateService visitDateService, UserService userService) {
        this.bookingService = bookingService;
        this.visitDateService = visitDateService;
        this.userService = userService;
    }
    
    @GetMapping("/available-dates")
    public List<VisitDate> getAvailableDates(@RequestParam(defaultValue = "1") Integer visitors) {
        return visitDateService.findAvailableDates(visitors);
    }
    
    @PostMapping("/new")
    public Booking createBooking(@RequestBody java.util.Map<String, Object> bookingData, Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();

        // Extract data from the request
        String visitDateStr = (String) bookingData.get("visitDate");
        Integer numberOfVisitors = ((Number) bookingData.get("numberOfVisitors")).intValue();
        String visitType = (String) bookingData.get("visitType");

        // Parse the date
        LocalDate visitDate = LocalDate.parse(visitDateStr);

        // Find or create VisitDate
        VisitDate visitDateEntity = visitDateService.findByVisitDate(visitDate);
        if (visitDateEntity == null) {
            visitDateEntity = new VisitDate();
            visitDateEntity.setVisitDate(visitDate);
            visitDateEntity.setMaxCapacity(100); // Default capacity
            visitDateEntity.setCurrentBookings(0);
            visitDateEntity = visitDateService.createVisitDate(visitDateEntity);
        }

        // Create booking
        Booking booking = new Booking();
        booking.setUser(currentUser);
        booking.setVisitDate(visitDateEntity);
        booking.setNumberOfVisitors(numberOfVisitors);
        booking.setSpecialRequests(visitType); // Store visitType in specialRequests

        return bookingService.createBooking(booking);
    }
    
    @GetMapping("/my-bookings")
    public List<Booking> myBookings(Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        return bookingService.findByUser(currentUser);
    }
    
    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF', 'ECOLOGIST')")
    public List<Booking> getAllBookings(@RequestParam(required = false) String status) {
        if ("pending".equals(status)) {
            return bookingService.findPendingBookings();
        } else {
            return bookingService.findAll();
        }
    }
    
    @PostMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public Booking approveBooking(@PathVariable Long id, Authentication authentication) {
        User admin = (User) authentication.getPrincipal();
        return bookingService.approveBooking(id, admin);
    }
    
    @PostMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public Booking rejectBooking(@PathVariable Long id, Authentication authentication) {
        User admin = (User) authentication.getPrincipal();
        return bookingService.rejectBooking(id, admin);
    }
    
    @DeleteMapping("/{id}/cancel")
    public void cancelBooking(@PathVariable Long id, Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        bookingService.cancelBooking(id, currentUser);
    }
    
    @GetMapping("/daily")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF', 'ECOLOGIST')")
    public List<Booking> dailyBookings(@RequestParam(required = false) String date) {
        if (date != null && !date.isEmpty()) {
            return bookingService.findByDate(LocalDate.parse(date));
        } else {
            return bookingService.findByDate(LocalDate.now());
        }
    }
}
