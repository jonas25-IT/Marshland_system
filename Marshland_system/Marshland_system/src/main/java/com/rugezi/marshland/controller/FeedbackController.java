package com.rugezi.marshland.controller;

import com.rugezi.marshland.entity.Feedback;
import com.rugezi.marshland.service.FeedbackService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/feedback")
public class FeedbackController {
    
    private final FeedbackService feedbackService;
    
    public FeedbackController(FeedbackService feedbackService) {
        this.feedbackService = feedbackService;
    }
    
    @PostMapping("/{bookingId}")
    @PreAuthorize("isAuthenticated()")
    public Feedback createFeedback(@RequestBody Feedback feedback, @PathVariable Long bookingId) {
        return feedbackService.createFeedback(feedback, bookingId);
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF', 'ECOLOGIST')")
    public Feedback getFeedbackById(@PathVariable Long id) {
        return feedbackService.getFeedbackById(id);
    }
    
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF', 'ECOLOGIST')")
    public List<Feedback> getAllFeedback() {
        return feedbackService.findAll();
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteFeedback(@PathVariable Long id) {
        feedbackService.deleteFeedback(id);
    }
}
