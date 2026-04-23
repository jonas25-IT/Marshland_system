package com.rugezi.marshland.service;

import com.rugezi.marshland.entity.Booking;
import com.rugezi.marshland.entity.Feedback;
import com.rugezi.marshland.entity.User;
import com.rugezi.marshland.repository.BookingRepository;
import com.rugezi.marshland.repository.FeedbackRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class FeedbackService {
    
    private final FeedbackRepository feedbackRepository;
    private final BookingRepository bookingRepository;
    
    public FeedbackService(FeedbackRepository feedbackRepository, BookingRepository bookingRepository) {
        this.feedbackRepository = feedbackRepository;
        this.bookingRepository = bookingRepository;
    }
    
    public Feedback createFeedback(Feedback feedback, Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new RuntimeException("Booking not found with id: " + bookingId));
        
        if (booking.getBookingStatus() != com.rugezi.marshland.entity.BookingStatus.APPROVED) {
            throw new RuntimeException("Feedback can only be submitted for approved bookings");
        }
        
        if (feedbackRepository.existsByBooking(booking)) {
            throw new RuntimeException("Feedback already exists for this booking");
        }
        
        feedback.setBooking(booking);
        
        return feedbackRepository.save(feedback);
    }
    
    public Optional<Feedback> findById(Long id) {
        return feedbackRepository.findById(id);
    }
    
    public Feedback getFeedbackById(Long id) {
        return feedbackRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Feedback not found with id: " + id));
    }
    
    public List<Feedback> findAll() {
        return feedbackRepository.findAll();
    }
    
    public List<Feedback> findByUserId(Long userId) {
        return feedbackRepository.findByUserId(userId);
    }
    
    public List<Feedback> findByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return feedbackRepository.findByDateRange(startDate, endDate);
    }
    
    public Double getAverageRatingByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return feedbackRepository.getAverageRatingByDateRange(startDate, endDate);
    }
    
    public long countFeedbackWithMinimumRating(Integer minRating) {
        return feedbackRepository.countFeedbackWithMinimumRating(minRating);
    }
    
    public void deleteFeedback(Long id) {
        if (!feedbackRepository.existsById(id)) {
            throw new RuntimeException("Feedback not found with id: " + id);
        }
        feedbackRepository.deleteById(id);
    }
    
    // RBAC specific methods
    public Feedback createFeedback(Feedback feedback) {
        return feedbackRepository.save(feedback);
    }
    
    public List<Feedback> getFeedbackByUser(User user) {
        return feedbackRepository.findAll().stream()
                .filter(f -> f.getUser() != null && f.getUser().getUserId().equals(user.getUserId()))
                .toList();
    }
    
    public List<Feedback> getFeedbackByUser(User user, int limit) {
        return getFeedbackByUser(user).stream()
                .limit(limit)
                .toList();
    }
}
