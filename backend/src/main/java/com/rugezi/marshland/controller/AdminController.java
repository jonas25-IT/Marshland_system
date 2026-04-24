package com.rugezi.marshland.controller;

import com.rugezi.marshland.entity.User;
import com.rugezi.marshland.entity.Booking;
import com.rugezi.marshland.entity.Species;
import com.rugezi.marshland.entity.VisitDate;
import com.rugezi.marshland.entity.GalleryPhoto;
import com.rugezi.marshland.service.UserService;
import com.rugezi.marshland.service.BookingService;
import com.rugezi.marshland.service.SpeciesService;
import com.rugezi.marshland.service.GalleryPhotoService;
import com.rugezi.marshland.service.analytics.AnalyticsService;
import com.rugezi.marshland.repository.VisitDateRepository;
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
public class AdminController {
    
    private final UserService userService;
    private final BookingService bookingService;
    private final SpeciesService speciesService;
    private final AnalyticsService analyticsService;
    private final VisitDateRepository visitDateRepository;
    private final GalleryPhotoService galleryPhotoService;
    
    public AdminController(UserService userService, BookingService bookingService, 
                          SpeciesService speciesService, AnalyticsService analyticsService,
                          VisitDateRepository visitDateRepository, GalleryPhotoService galleryPhotoService) {
        this.userService = userService;
        this.bookingService = bookingService;
        this.speciesService = speciesService;
        this.analyticsService = analyticsService;
        this.visitDateRepository = visitDateRepository;
        this.galleryPhotoService = galleryPhotoService;
    }
    
    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getAdminDashboard(Authentication authentication) {
        System.out.println(">>> ADMIN ACCESS ATTEMPT: User=" + authentication.getName());
        System.out.println(">>> ADMIN ACCESS AUTHORITIES: " + authentication.getAuthorities());
        
        try {
            // Check for specific authority string to handle potential ROLE_ prefix drift
            boolean hasAdminRank = authentication.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ADMIN") || a.getAuthority().equals("ROLE_ADMIN"));
            
            if (!hasAdminRank) {
                System.err.println(">>> ACCESS REJECTED: User lacks ADMIN or ROLE_ADMIN authority");
                return ResponseEntity.status(403).body(Map.of("error", "Access Denied: Insufficient Authority"));
            }

            System.out.println(">>> STARTING DATABASE PROBE...");
            try {
                User testUser = userService.findById(15L);
                System.out.println(">>> PROBE SUCCESS: Found user " + testUser.getEmail());
            } catch (Exception e) {
                System.out.println(">>> PROBE FAILED: Cannot find user ID 15. Error: " + e.getMessage());
            }

            Map<String, Object> dashboard = new HashMap<>();
            
            // System Overview
            dashboard.put("totalUsers", userService.getTotalUsersCount());
            dashboard.put("totalSpecies", speciesService.getTotalSpeciesCount());
            dashboard.put("totalBookings", bookingService.getTotalBookingsCount());
            dashboard.put("pendingBookings", bookingService.getPendingBookingsCount());
            
            // Recent Activity
            dashboard.put("recentUsers", userService.getRecentUsers(5));
            dashboard.put("recentBookings", bookingService.getRecentBookings(5));
            
            // Analytics
            dashboard.put("platformGrowth", analyticsService.getPlatformGrowthData());
            dashboard.put("bookingStatusDistribution", analyticsService.getBookingStatusDistribution());
            
            return ResponseEntity.ok(dashboard);
        } catch (Exception e) {
            System.err.println("!!! DASHBOARD DATA ERROR: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
    
    @GetMapping("/users")
    public ResponseEntity<Map<String, Object>> getAllUsers() {
        List<User> users = userService.getAllUsers();
        return ResponseEntity.ok(Map.of(
            "success", true,
            "data", users
        ));
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
    public ResponseEntity<Map<String, Object>> getPendingBookings() {
        List<Booking> bookings = bookingService.getPendingBookings();
        return ResponseEntity.ok(Map.of(
            "success", true,
            "data", bookings
        ));
    }
    
    @GetMapping("/bookings/all")
    public ResponseEntity<Map<String, Object>> getAllBookings() {
        List<Booking> bookings = bookingService.getAllBookings();
        return ResponseEntity.ok(Map.of(
            "success", true,
            "data", bookings
        ));
    }
    
    @PostMapping("/bookings")
    public ResponseEntity<?> createBooking(@RequestBody Booking booking, Authentication authentication) {
        try {
            User admin = (User) authentication.getPrincipal();
            
            // For admin-created bookings, we need to set a user
            // If no user is provided, use the admin as the booking user
            if (booking.getUser() == null) {
                booking.setUser(admin);
            }
            
            // Ensure VisitDate is properly loaded from database
            if (booking.getVisitDate() != null && booking.getVisitDate().getDateId() != null) {
                VisitDate visitDate = visitDateRepository.findById(booking.getVisitDate().getDateId())
                    .orElseThrow(() -> new RuntimeException("Visit date not found"));
                booking.setVisitDate(visitDate);
            }
            
            Booking createdBooking = bookingService.createBooking(booking);
            return ResponseEntity.ok(createdBooking);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @PutMapping("/bookings/{bookingId}")
    public ResponseEntity<?> updateBooking(@PathVariable Long bookingId, @RequestBody Booking booking, 
                                        Authentication authentication) {
        try {
            User admin = (User) authentication.getPrincipal();
            booking.setBookingId(bookingId);
            Booking updatedBooking = bookingService.updateBooking(booking, admin);
            return ResponseEntity.ok(updatedBooking);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @DeleteMapping("/bookings/{bookingId}")
    public ResponseEntity<?> deleteBooking(@PathVariable Long bookingId) {
        try {
            bookingService.deleteBooking(bookingId);
            return ResponseEntity.ok(Map.of("message", "Booking deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @PostMapping("/bookings/{bookingId}/approve")
    public ResponseEntity<?> approveBooking(@PathVariable Long bookingId, Authentication authentication) {
        try {
            System.out.println(">>> APPROVAL REQUEST: bookingId=" + bookingId + ", admin=" + authentication.getName());
            User admin = (User) authentication.getPrincipal();
            Booking result = bookingService.approveBooking(bookingId, admin);
            return ResponseEntity.ok(Map.of(
                "message", "Booking approved successfully",
                "bookingId", result.getBookingId(),
                "status", result.getBookingStatus().toString(),
                "approvedBy", admin.getEmail()
            ));
        } catch (RuntimeException e) {
            System.err.println(">>> BOOKING APPROVAL ERROR: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of(
                "error", e.getMessage(),
                "bookingId", bookingId,
                "timestamp", System.currentTimeMillis()
            ));
        } catch (Exception e) {
            System.err.println(">>> UNEXPECTED BOOKING APPROVAL ERROR: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of(
                "error", "Unexpected error during booking approval: " + e.getMessage(),
                "bookingId", bookingId
            ));
        }
    }
    
    @GetMapping("/bookings/{bookingId}/debug")
    public ResponseEntity<?> debugBooking(@PathVariable Long bookingId, Authentication authentication) {
        try {
            System.out.println(">>> DEBUG REQUEST: bookingId=" + bookingId + ", user=" + authentication.getName());
            
            Map<String, Object> debugInfo = new HashMap<>();
            
            // Check if booking exists
            try {
                Booking booking = bookingService.findById(bookingId);
                debugInfo.put("exists", true);
                debugInfo.put("bookingId", booking.getBookingId());
                debugInfo.put("status", booking.getBookingStatus().toString());
                debugInfo.put("userEmail", booking.getUser().getEmail());
                debugInfo.put("visitDate", booking.getVisitDate().getVisitDate().toString());
                debugInfo.put("numberOfVisitors", booking.getNumberOfVisitors());
                debugInfo.put("createdAt", booking.getCreatedAt().toString());
                debugInfo.put("approvedBy", booking.getApprovedBy() != null ? booking.getApprovedBy().getEmail() : null);
                debugInfo.put("approvalDate", booking.getApprovalDate() != null ? booking.getApprovalDate().toString() : null);
            } catch (Exception e) {
                debugInfo.put("exists", false);
                debugInfo.put("error", e.getMessage());
            }
            
            // Check all pending bookings
            List<Booking> pendingBookings = bookingService.getPendingBookings();
            debugInfo.put("totalPendingBookings", pendingBookings.size());
            debugInfo.put("pendingBookingIds", pendingBookings.stream().map(b -> b.getBookingId()).toList());
            
            return ResponseEntity.ok(debugInfo);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
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
    public ResponseEntity<Map<String, Object>> getAllSpeciesForAdmin() {
        List<Species> species = speciesService.getAllSpecies();
        return ResponseEntity.ok(Map.of(
            "success", true,
            "data", species
        ));
    }
    
    @PostMapping("/species/create")
    public ResponseEntity<?> createSpecies(@RequestBody Species species, Authentication authentication) {
        try {
            User admin = (User) authentication.getPrincipal();
            Species createdSpecies = speciesService.createSpecies(species, admin);
            return ResponseEntity.ok(createdSpecies);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @PutMapping("/species/{speciesId}")
    public ResponseEntity<?> updateSpecies(@PathVariable Long speciesId, @RequestBody Species species, 
                                         Authentication authentication) {
        try {
            User admin = (User) authentication.getPrincipal();
            species.setSpeciesId(speciesId);
            Species updatedSpecies = speciesService.updateSpecies(species, admin);
            return ResponseEntity.ok(updatedSpecies);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
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
    
    // ==================== GALLERY MANAGEMENT ====================

    @GetMapping("/gallery/photos")
    @PreAuthorize("hasAnyRole('ADMIN', 'ECOLOGIST')")
    public ResponseEntity<?> getAllGalleryPhotos() {
        try {
            return ResponseEntity.ok(galleryPhotoService.getAllPhotos());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/gallery/photos/{photoId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ECOLOGIST')")
    public ResponseEntity<?> getGalleryPhotoById(@PathVariable Long photoId) {
        try {
            return ResponseEntity.ok(galleryPhotoService.getPhotoById(photoId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/gallery/photos")
    @PreAuthorize("hasAnyRole('ADMIN', 'ECOLOGIST')")
    public ResponseEntity<?> createGalleryPhoto(@RequestBody GalleryPhoto photo, Authentication authentication) {
        try {
            User admin = (User) authentication.getPrincipal();
            GalleryPhoto createdPhoto = galleryPhotoService.createPhoto(photo, admin);
            return ResponseEntity.ok(createdPhoto);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/gallery/photos/{photoId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ECOLOGIST')")
    public ResponseEntity<?> updateGalleryPhoto(@PathVariable Long photoId, @RequestBody GalleryPhoto photoDetails) {
        try {
            GalleryPhoto updatedPhoto = galleryPhotoService.updatePhoto(photoId, photoDetails);
            return ResponseEntity.ok(updatedPhoto);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/gallery/photos/{photoId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ECOLOGIST')")
    public ResponseEntity<?> deleteGalleryPhoto(@PathVariable Long photoId) {
        try {
            galleryPhotoService.deletePhoto(photoId);
            return ResponseEntity.ok(Map.of("message", "Photo deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @GetMapping("/gallery/photos/statistics")
    public ResponseEntity<?> getGalleryStatistics() {
        try {
            return ResponseEntity.ok(galleryPhotoService.getPhotoStatistics());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @GetMapping("/gallery/photos/categories")
    @PreAuthorize("hasAnyRole('ADMIN', 'ECOLOGIST')")
    public ResponseEntity<?> getGalleryCategories() {
        try {
            return ResponseEntity.ok(galleryPhotoService.getAllCategories());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
