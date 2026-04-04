package com.rugezi.marshland.repository;

import com.rugezi.marshland.entity.Booking;
import com.rugezi.marshland.entity.BookingStatus;
import com.rugezi.marshland.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long>, JpaSpecificationExecutor<Booking> {
    
    List<Booking> findByUser(User user);
    
    List<Booking> findByBookingStatus(BookingStatus status);
    
    @Query("SELECT b FROM Booking b WHERE b.visitDate.visitDate = :date ORDER BY b.bookingDate")
    List<Booking> findByVisitDate(@Param("date") LocalDate date);
    
    @Query("SELECT b FROM Booking b WHERE b.visitDate.visitDate BETWEEN :startDate AND :endDate ORDER BY b.visitDate.visitDate, b.bookingDate")
    List<Booking> findByDateRange(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    @Query("SELECT b FROM Booking b WHERE b.bookingStatus = :status AND b.visitDate.visitDate >= :date ORDER BY b.visitDate.visitDate")
    List<Booking> findByStatusAndFutureDate(@Param("status") BookingStatus status, @Param("date") LocalDate date);
    
    @Query("SELECT COUNT(b) FROM Booking b WHERE b.visitDate.visitDate = :date AND b.bookingStatus = 'APPROVED'")
    long countApprovedBookingsByDate(@Param("date") LocalDate date);
    
    @Query("SELECT b FROM Booking b WHERE b.user = :user AND b.bookingStatus = 'APPROVED' AND b.visitDate.visitDate >= :date")
    List<Booking> findUpcomingApprovedBookings(@Param("user") User user, @Param("date") LocalDate date);
    
    @Query("SELECT b FROM Booking b WHERE b.user.userId = :userId")
    List<Booking> findByUserId(@Param("userId") Long userId);
    
    @Query("SELECT b FROM Booking b WHERE b.user.userId = :userId AND b.bookingStatus = :status")
    List<Booking> findByUserIdAndStatus(@Param("userId") Long userId, @Param("status") BookingStatus status);

    List<Booking> findByVisitDateVisitDateBetween(LocalDate startDate, LocalDate endDate);
    
    @Query("SELECT b FROM Booking b ORDER BY b.bookingDate DESC")
    List<Booking> findTop10ByOrderByBookingDateDesc();
    
    @Query("SELECT COUNT(b) FROM Booking b WHERE b.bookingStatus = :status")
    long countByBookingStatus(@Param("status") BookingStatus status);
    
    @Query("SELECT b FROM Booking b ORDER BY b.bookingDate DESC LIMIT 200")
    List<Booking> findTop200ByOrderByBookingDateDesc();

    List<Booking> findTop100ByOrderByBookingDateDesc();

    List<Booking> findByVisitDateVisitDate(LocalDate today);
}
