package com.rugezi.marshland.repository;

import com.rugezi.marshland.entity.VisitDate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface VisitDateRepository extends JpaRepository<VisitDate, Long> {
    
    List<VisitDate> findByVisitDateBetweenOrderByVisitDate(LocalDate startDate, LocalDate endDate);
    
    List<VisitDate> findByVisitDateAfterOrderByVisitDate(LocalDate date);
    
    @Query("SELECT v FROM VisitDate v WHERE v.visitDate >= :date AND (v.maxCapacity - v.currentBookings) >= :requiredVisitors ORDER BY v.visitDate")
    List<VisitDate> findAvailableDates(@Param("date") LocalDate date, @Param("requiredVisitors") Integer requiredVisitors);
    
    @Query("SELECT v FROM VisitDate v WHERE v.visitDate = :date")
    VisitDate findByVisitDate(@Param("date") LocalDate date);
    
    boolean existsByVisitDate(LocalDate date);
}
