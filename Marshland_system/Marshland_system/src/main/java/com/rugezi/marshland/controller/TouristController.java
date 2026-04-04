package com.rugezi.marshland.controller;

import com.rugezi.marshland.entity.Booking;
import com.rugezi.marshland.entity.User;
import com.rugezi.marshland.entity.Feedback;
import com.rugezi.marshland.service.BookingService;
import com.rugezi.marshland.service.SpeciesService;
import com.rugezi.marshland.service.FeedbackService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tourist")
@CrossOrigin(origins = "*", maxAge = 3600)
@PreAuthorize("hasAnyRole('ADMIN', 'TOURIST')")
public class TouristController {
    
    private final BookingService bookingService;
    private final SpeciesService speciesService;
    private final FeedbackService feedbackService;
    
    public TouristController(BookingService bookingService, SpeciesService speciesService, 
                            FeedbackService feedbackService) {
        this.bookingService = bookingService;
        this.speciesService = speciesService;
        this.feedbackService = feedbackService;
    }
    
    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getTouristDashboard(Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        Map<String, Object> dashboard = new HashMap<>();
        
        // User profile info
        dashboard.put("userInfo", Map.of(
            "name", currentUser.getFirstName(),
            "email", currentUser.getEmail(),
            "memberSince", currentUser.getCreatedAt()
        ));
        
        // Booking overview
        dashboard.put("totalBookings", bookingService.getBookingsByUser(currentUser).size());
        dashboard.put("upcomingBookings", bookingService.getUpcomingBookingsForUser(currentUser));
        dashboard.put("pastBookings", bookingService.getPastBookingsForUser(currentUser));
        
        // Featured species for tourists
        dashboard.put("featuredSpecies", speciesService.getFeaturedSpecies(6));
        
        // Recent feedback
        dashboard.put("myFeedback", feedbackService.getFeedbackByUser(currentUser, 3));
        
        return ResponseEntity.ok(dashboard);
    }
    
    @PostMapping("/bookings/create")
    public ResponseEntity<?> createBooking(@RequestBody Booking booking, Authentication authentication) {
        try {
            User currentUser = (User) authentication.getPrincipal();
            booking.setUser(currentUser);
            Booking createdBooking = bookingService.createBooking(booking);
            return ResponseEntity.ok(createdBooking);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @GetMapping("/bookings/my-bookings")
    public ResponseEntity<List<Booking>> getMyBookings(Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        List<Booking> bookings = bookingService.getBookingsByUser(currentUser);
        return ResponseEntity.ok(bookings);
    }
    
    @GetMapping("/bookings/upcoming")
    public ResponseEntity<List<Booking>> getUpcomingBookings(Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        List<Booking> bookings = bookingService.getUpcomingBookingsForUser(currentUser);
        return ResponseEntity.ok(bookings);
    }
    
    @GetMapping("/bookings/past")
    public ResponseEntity<List<Booking>> getPastBookings(Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        List<Booking> bookings = bookingService.getPastBookingsForUser(currentUser);
        return ResponseEntity.ok(bookings);
    }
    
    @PostMapping("/bookings/{bookingId}/cancel")
    public ResponseEntity<?> cancelBooking(@PathVariable Long bookingId, Authentication authentication) {
        try {
            User currentUser = (User) authentication.getPrincipal();
            bookingService.cancelBooking(bookingId, currentUser);
            return ResponseEntity.ok(Map.of("message", "Booking cancelled successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @GetMapping("/species/featured")
    public ResponseEntity<List> getFeaturedSpecies() {
        List species = speciesService.getFeaturedSpecies(8);
        return ResponseEntity.ok(species);
    }
    
    @GetMapping("/species/{speciesId}")
    public ResponseEntity<?> getSpeciesDetails(@PathVariable Long speciesId) {
        try {
            var species = speciesService.getSpeciesById(speciesId);
            return ResponseEntity.ok(species);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Species not found"));
        }
    }
    
    @PostMapping("/feedback/create")
    public ResponseEntity<?> createFeedback(@RequestBody Feedback feedback, Authentication authentication) {
        try {
            User currentUser = (User) authentication.getPrincipal();
            feedback.setUser(currentUser);
            Feedback createdFeedback = feedbackService.createFeedback(feedback);
            return ResponseEntity.ok(createdFeedback);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @GetMapping("/feedback/my-feedback")
    public ResponseEntity<List<Feedback>> getMyFeedback(Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        List<Feedback> feedback = feedbackService.getFeedbackByUser(currentUser);
        return ResponseEntity.ok(feedback);
    }
    
    @GetMapping("/visit-dates/available")
    public ResponseEntity<List> getAvailableVisitDates() {
        List availableDates = bookingService.getAvailableVisitDates();
        return ResponseEntity.ok(availableDates);
    }
    
    @GetMapping("/biodiversity/info")
    public ResponseEntity<Map<String, Object>> getBiodiversityInfo() {
        Map<String, Object> info = new HashMap<>();
        
        info.put("totalSpecies", speciesService.getTotalSpeciesCount());
        info.put("speciesByType", speciesService.getSpeciesCountByType());
        info.put("featuredSpecies", speciesService.getFeaturedSpecies(4));
        info.put("conservationHighlights", speciesService.getSpeciesByConservationStatus("Endangered"));
        
        return ResponseEntity.ok(info);
    }
    
    @GetMapping("/profile")
    public ResponseEntity<User> getProfile(Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        return ResponseEntity.ok(currentUser);
    }
    
    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody Map<String, String> profileData, 
                                         Authentication authentication) {
        try {
            User currentUser = (User) authentication.getPrincipal();
            User updatedUser = bookingService.updateUserProfile(currentUser, profileData);
            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
