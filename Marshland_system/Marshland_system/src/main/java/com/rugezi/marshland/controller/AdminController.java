package com.rugezi.marshland.controller;

import com.rugezi.marshland.entity.User;
import com.rugezi.marshland.entity.Booking;
import com.rugezi.marshland.entity.Species;
import com.rugezi.marshland.service.UserService;
import com.rugezi.marshland.service.BookingService;
import com.rugezi.marshland.service.SpeciesService;
import com.rugezi.marshland.service.analytics.AnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*", maxAge = 3600)
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    
    private final UserService userService;
    private final BookingService bookingService;
    private final SpeciesService speciesService;
    private final AnalyticsService analyticsService;
    
    public AdminController(UserService userService, BookingService bookingService, 
                          SpeciesService speciesService, AnalyticsService analyticsService) {
        this.userService = userService;
        this.bookingService = bookingService;
        this.speciesService = speciesService;
        this.analyticsService = analyticsService;
    }
    
    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getAdminDashboard() {
        Map<String, Object> dashboard = new HashMap<>();
        
        // System Overview
        dashboard.put("totalUsers", userService.getTotalUsersCount());
        dashboard.put("totalBookings", bookingService.getTotalBookingsCount());
        dashboard.put("totalSpecies", speciesService.getTotalSpeciesCount());
        dashboard.put("pendingBookings", bookingService.getPendingBookingsCount());
        
        // Recent activity
        dashboard.put("recentUsers", userService.getRecentUsers(5));
        dashboard.put("recentBookings", bookingService.getRecentBookings(5));
        
        // Analytics
        LocalDate today = LocalDate.now();
        LocalDate monthAgo = today.minusMonths(1);
        dashboard.put("analytics", analyticsService.getDashboardMetrics(monthAgo, today));
        
        return ResponseEntity.ok(dashboard);
    }
    
    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }
    
    @PostMapping("/users")
    public ResponseEntity<?> createUser(@RequestBody User user) {
        try {
            User createdUser = userService.createUser(user);
            return ResponseEntity.ok(createdUser);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @PutMapping("/users/{userId}")
    public ResponseEntity<?> updateUser(@PathVariable Long userId, @RequestBody User user) {
        try {
            User updatedUser = userService.updateUser(userId, user);
            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @PostMapping("/users/{userId}/approve")
    public ResponseEntity<?> approveUser(@PathVariable Long userId) {
        try {
            userService.approveUser(userId);
            return ResponseEntity.ok(Map.of("message", "User approved successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @DeleteMapping("/users/{userId}")
    public ResponseEntity<?> deleteUser(@PathVariable Long userId) {
        try {
            userService.deleteUser(userId);
            return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @GetMapping("/bookings/pending")
    public ResponseEntity<List<Booking>> getPendingBookings() {
        List<Booking> bookings = bookingService.getPendingBookings();
        return ResponseEntity.ok(bookings);
    }
    
    @PostMapping("/bookings/{bookingId}/approve")
    public ResponseEntity<?> approveBooking(@PathVariable Long bookingId, Authentication authentication) {
        try {
            User admin = (User) authentication.getPrincipal();
            bookingService.approveBooking(bookingId, admin);
            return ResponseEntity.ok(Map.of("message", "Booking approved successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @PostMapping("/bookings/{bookingId}/reject")
    public ResponseEntity<?> rejectBooking(@PathVariable Long bookingId, @RequestBody Map<String, String> request, 
                                         Authentication authentication) {
        try {
            User admin = (User) authentication.getPrincipal();
            String reason = request.get("reason");
            bookingService.rejectBooking(bookingId, admin);
            return ResponseEntity.ok(Map.of("message", "Booking rejected successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @GetMapping("/species/all")
    public ResponseEntity<List<Species>> getAllSpeciesForAdmin() {
        List<Species> species = speciesService.getAllSpecies();
        return ResponseEntity.ok(species);
    }
    
    @DeleteMapping("/species/{speciesId}")
    public ResponseEntity<?> deleteSpecies(@PathVariable Long speciesId) {
        try {
            speciesService.deleteSpecies(speciesId);
            return ResponseEntity.ok(Map.of("message", "Species deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/analytics/reports")
    public ResponseEntity<Map<String, Object>> getSystemReports() {
        Map<String, Object> reports = new HashMap<>();

        reports.put("userStats", userService.getUserStatistics());
        reports.put("bookingStats", bookingService.getBookingStatistics());
        reports.put("speciesStats", speciesService.getSpeciesStatistics());

        // ✅ FIX: Add date range
        LocalDate today = LocalDate.now();
        LocalDate monthAgo = today.minusMonths(1);

        reports.put("financialAnalytics", analyticsService.getFinancialAnalytics(monthAgo, today));
        reports.put("visitorAnalytics", analyticsService.getVisitorAnalytics(monthAgo, today));

        return ResponseEntity.ok(reports);
    }
    
    @GetMapping("/system/health")
    public ResponseEntity<Map<String, Object>> getSystemHealth() {
        Map<String, Object> health = new HashMap<>();
        
        health.put("status", "healthy");
        health.put("database", "connected");
        health.put("timestamp", System.currentTimeMillis());
        health.put("version", "1.0.0");
        
        return ResponseEntity.ok(health);
    }
}
