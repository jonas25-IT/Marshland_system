package com.rugezi.marshland.controller;

import com.rugezi.marshland.entity.Booking;
import com.rugezi.marshland.entity.User;
import com.rugezi.marshland.entity.VisitDate;
import com.rugezi.marshland.service.BookingService;
import com.rugezi.marshland.service.VisitDateService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/staff")
@CrossOrigin(origins = "*", maxAge = 3600)
@PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
public class StaffController {
    
    private final BookingService bookingService;
    private final VisitDateService visitDateService;
    
    public StaffController(BookingService bookingService, VisitDateService visitDateService) {
        this.bookingService = bookingService;
        this.visitDateService = visitDateService;
    }
    
    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getStaffDashboard(Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        Map<String, Object> dashboard = new HashMap<>();
        
        // Today's overview
        LocalDate today = LocalDate.now();
        dashboard.put("todayDate", today);
        dashboard.put("todayBookings", bookingService.getBookingsByDate(today));
        dashboard.put("totalToday", bookingService.getBookingsByDate(today).size());
        dashboard.put("checkedInToday", bookingService.getCheckedInBookings(today).size());
        dashboard.put("pendingToday", bookingService.getPendingBookingsForDate(today).size());
        
        // This week's overview
        dashboard.put("weekBookings", bookingService.getBookingsThisWeek());
        dashboard.put("weekTotal", bookingService.getBookingsThisWeek().size());
        
        // Recent activity
        dashboard.put("recentCheckins", bookingService.getRecentCheckins(5));
        
        // Staff info
        dashboard.put("staffInfo", Map.of(
            "name", currentUser.getFirstName(),
            "role", currentUser.getRole(),
            "shift", "Morning" // Could be dynamic
        ));
        
        return ResponseEntity.ok(dashboard);
    }
    
    @GetMapping("/bookings/daily")
    public ResponseEntity<List<Booking>> getDailyBookings(@RequestParam(required = false) String date) {
        LocalDate targetDate = date != null ? LocalDate.parse(date) : LocalDate.now();
        List<Booking> bookings = bookingService.getBookingsByDate(targetDate);
        return ResponseEntity.ok(bookings);
    }
    
    @GetMapping("/bookings/today")
    public ResponseEntity<Map<String, Object>> getTodayBookings() {
        LocalDate today = LocalDate.now();
        List<Booking> allBookings = bookingService.getBookingsByDate(today);
        List<Booking> checkedIn = bookingService.getCheckedInBookings(today);
        List<Booking> pending = bookingService.getPendingBookingsForDate(today);
        
        Map<String, Object> response = new HashMap<>();
        response.put("date", today);
        response.put("allBookings", allBookings);
        response.put("checkedIn", checkedIn);
        response.put("pending", pending);
        response.put("statistics", Map.of(
            "total", allBookings.size(),
            "checkedIn", checkedIn.size(),
            "pending", pending.size()
        ));
        
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/bookings/{bookingId}/checkin")
    public ResponseEntity<?> checkInVisitor(@PathVariable Long bookingId, 
                                           @RequestBody(required = false) Map<String, Object> checkinData,
                                           Authentication authentication) {
        try {
            User staff = (User) authentication.getPrincipal();
            String notes = checkinData != null ? (String) checkinData.get("notes") : null;
            
            bookingService.checkInBooking(bookingId, staff, notes);
            return ResponseEntity.ok(Map.of("message", "Visitor checked in successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @PostMapping("/bookings/{bookingId}/checkout")
    public ResponseEntity<?> checkOutVisitor(@PathVariable Long bookingId, 
                                            @RequestBody(required = false) Map<String, Object> checkoutData,
                                            Authentication authentication) {
        try {
            User staff = (User) authentication.getPrincipal();
            String notes = checkoutData != null ? (String) checkoutData.get("notes") : null;
            
            bookingService.checkOutBooking(bookingId, staff, notes);
            return ResponseEntity.ok(Map.of("message", "Visitor checked out successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @GetMapping("/bookings/week")
    public ResponseEntity<Map<String, Object>> getWeeklyBookings() {
        List<Booking> weekBookings = bookingService.getBookingsThisWeek();
        
        Map<String, Object> response = new HashMap<>();
        response.put("weekStart", LocalDate.now().minusDays(LocalDate.now().getDayOfWeek().getValue() - 1));
        response.put("weekEnd", LocalDate.now().plusDays(7 - LocalDate.now().getDayOfWeek().getValue()));
        response.put("bookings", weekBookings);
        response.put("total", weekBookings.size());
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/visit-dates/capacity")
    public ResponseEntity<Map<String, Object>> getCapacityInfo() {
        LocalDate today = LocalDate.now();
        List availableDates = visitDateService.getAvailableDates(today, today.plusDays(30));
        
        Map<String, Object> response = new HashMap<>();
        response.put("availableDates", availableDates);
        response.put("totalCapacity", visitDateService.getTotalCapacity(today, today.plusDays(30)));
        response.put("bookedCapacity", visitDateService.getBookedCapacity(today, today.plusDays(30)));
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/logs/checkins")
    public ResponseEntity<List<Booking>> getRecentCheckins(@RequestParam(defaultValue = "10") int limit) {
        List<Booking> checkins = bookingService.getRecentCheckins(limit);
        return ResponseEntity.ok(checkins);
    }
    
    @GetMapping("/logs/activities")
    public ResponseEntity<Map<String, Object>> getActivityLogs(@RequestParam(required = false) String date) {
        LocalDate targetDate = date != null ? LocalDate.parse(date) : LocalDate.now();
        
        Map<String, Object> logs = new HashMap<>();
        logs.put("date", targetDate);
        logs.put("checkins", bookingService.getCheckedInBookings(targetDate));
        logs.put("checkouts", bookingService.getCheckedOutBookings(targetDate));
        logs.put("cancellations", bookingService.getCancelledBookings(targetDate));
        
        return ResponseEntity.ok(logs);
    }
    
    @PostMapping("/visit-notes/{bookingId}")
    public ResponseEntity<?> addVisitNote(@PathVariable Long bookingId, 
                                        @RequestBody Map<String, String> noteData,
                                        Authentication authentication) {
        try {
            User staff = (User) authentication.getPrincipal();
            String note = noteData.get("note");
            
            bookingService.addVisitNote(bookingId, staff, note);
            return ResponseEntity.ok(Map.of("message", "Visit note added successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @PostMapping("/bookings")
    public ResponseEntity<?> createBooking(@RequestBody Booking booking,
                                         Authentication authentication) {
        try {
            User staff = (User) authentication.getPrincipal();
            Booking createdBooking = bookingService.createBooking(booking);
            return ResponseEntity.ok(createdBooking);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @PutMapping("/bookings/{bookingId}")
    public ResponseEntity<?> updateBooking(@PathVariable Long bookingId,
                                         @RequestBody Booking booking,
                                         Authentication authentication) {
        try {
            User staff = (User) authentication.getPrincipal();
            booking.setBookingId(bookingId);
            Booking updatedBooking = bookingService.updateBooking(booking);
            return ResponseEntity.ok(updatedBooking);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @DeleteMapping("/bookings/{bookingId}")
    public ResponseEntity<?> deleteBooking(@PathVariable Long bookingId,
                                         Authentication authentication) {
        try {
            User staff = (User) authentication.getPrincipal();
            bookingService.deleteBooking(bookingId);
            return ResponseEntity.ok(Map.of("message", "Booking deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @PostMapping("/visit-dates")
    public ResponseEntity<?> createVisitDate(@RequestBody VisitDate visitDate,
                                           Authentication authentication) {
        try {
            User staff = (User) authentication.getPrincipal();
            VisitDate createdDate = visitDateService.createVisitDate(visitDate);
            return ResponseEntity.ok(createdDate);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @PutMapping("/visit-dates/{dateId}")
    public ResponseEntity<?> updateVisitDate(@PathVariable Long dateId,
                                           @RequestBody VisitDate visitDate,
                                           Authentication authentication) {
        try {
            User staff = (User) authentication.getPrincipal();
            visitDate.setDateId(dateId);
            VisitDate updatedDate = visitDateService.updateVisitDate(visitDate);
            return ResponseEntity.ok(updatedDate);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @DeleteMapping("/visit-dates/{dateId}")
    public ResponseEntity<?> deleteVisitDate(@PathVariable Long dateId,
                                           Authentication authentication) {
        try {
            User staff = (User) authentication.getPrincipal();
            visitDateService.deleteVisitDate(dateId);
            return ResponseEntity.ok(Map.of("message", "Visit date deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @GetMapping("/visit-dates")
    public ResponseEntity<List<VisitDate>> getAllVisitDates(Authentication authentication) {
        try {
            List<VisitDate> visitDates = visitDateService.getAllVisitDates();
            return ResponseEntity.ok(visitDates);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/statistics/daily")
    public ResponseEntity<Map<String, Object>> getDailyStatistics() {
        LocalDate today = LocalDate.now();
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("today", Map.of(
            "totalBookings", bookingService.getBookingsByDate(today).size(),
            "checkedIn", bookingService.getCheckedInBookings(today).size(),
            "pending", bookingService.getPendingBookingsForDate(today).size(),
            "noShows", bookingService.getNoShows(today).size()
        ));
        
        stats.put("week", Map.of(
            "totalBookings", bookingService.getBookingsThisWeek().size(),
            "averageDaily", bookingService.getAverageDailyBookingsThisWeek()
        ));
        
        return ResponseEntity.ok(stats);
    }
}
