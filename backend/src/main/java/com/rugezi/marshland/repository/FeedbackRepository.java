package com.rugezi.marshland.repository;

import com.rugezi.marshland.entity.Booking;
import com.rugezi.marshland.entity.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    
    List<Feedback> findByBooking(Booking booking);
    
    @Query("SELECT f FROM Feedback f WHERE f.booking.user.id = :userId ORDER BY f.submittedAt DESC")
    List<Feedback> findByUserId(@Param("userId") Long userId);
    
    @Query("SELECT f FROM Feedback f WHERE f.submittedAt BETWEEN :startDate AND :endDate ORDER BY f.submittedAt DESC")
    List<Feedback> findByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT AVG(f.rating) FROM Feedback f WHERE f.booking.visitDate.visitDate BETWEEN :startDate AND :endDate")
    Double getAverageRatingByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT COUNT(f) FROM Feedback f WHERE f.rating >= :minRating")
    long countFeedbackWithMinimumRating(@Param("minRating") Integer minRating);
    
    boolean existsByBooking(Booking booking);
}
