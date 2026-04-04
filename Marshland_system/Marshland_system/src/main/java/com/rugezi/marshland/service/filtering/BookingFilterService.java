package com.rugezi.marshland.service.filtering;

import com.rugezi.marshland.entity.Booking;
import com.rugezi.marshland.entity.BookingStatus;
import com.rugezi.marshland.repository.BookingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import jakarta.persistence.criteria.Predicate;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class BookingFilterService {
    
    @Autowired
    private BookingRepository bookingRepository;
    
    /**
     * Advanced booking filtering with multiple criteria
     */
    public Page<Booking> filterBookings(BookingFilterCriteria criteria, Pageable pageable) {
        Specification<Booking> specification = (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();
            
            // Filter by user ID
            if (criteria.getUserId() != null) {
                predicates.add(criteriaBuilder.equal(root.get("user").get("userId"), criteria.getUserId()));
            }
            
            // Filter by booking status
            if (criteria.getStatus() != null) {
                predicates.add(criteriaBuilder.equal(root.get("bookingStatus"), criteria.getStatus()));
            }
            
            // Filter by status list (multiple statuses)
            if (criteria.getStatuses() != null && !criteria.getStatuses().isEmpty()) {
                predicates.add(root.get("bookingStatus").in(criteria.getStatuses()));
            }
            
            // Filter by date range (booking date)
            if (criteria.getStartDate() != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(
                    root.get("bookingDate"), criteria.getStartDate()));
            }
            
            if (criteria.getEndDate() != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(
                    root.get("bookingDate"), criteria.getEndDate()));
            }
            
            // Filter by visit date range
            if (criteria.getVisitStartDate() != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(
                    root.get("visitDate").get("visitDate"), criteria.getVisitStartDate()));
            }
            
            if (criteria.getVisitEndDate() != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(
                    root.get("visitDate").get("visitDate"), criteria.getVisitEndDate()));
            }
            
            // Filter by number of visitors range
            if (criteria.getMinVisitors() != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(
                    root.get("numberOfVisitors"), criteria.getMinVisitors()));
            }
            
            if (criteria.getMaxVisitors() != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(
                    root.get("numberOfVisitors"), criteria.getMaxVisitors()));
            }
            
            // Filter by approval user
            if (criteria.getApprovedById() != null) {
                predicates.add(criteriaBuilder.equal(
                    root.get("approvedBy").get("userId"), criteria.getApprovedById()));
            }
            
            // Filter by special requests (contains)
            if (criteria.getSpecialRequests() != null && !criteria.getSpecialRequests().trim().isEmpty()) {
                predicates.add(criteriaBuilder.like(
                    criteriaBuilder.lower(root.get("specialRequests")),
                    "%" + criteria.getSpecialRequests().toLowerCase() + "%"));
            }
            
            // Filter by user email
            if (criteria.getUserEmail() != null && !criteria.getUserEmail().trim().isEmpty()) {
                predicates.add(criteriaBuilder.like(
                    criteriaBuilder.lower(root.get("user").get("email")),
                    "%" + criteria.getUserEmail().toLowerCase() + "%"));
            }
            
            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
        
        return bookingRepository.findAll(specification, pageable);
    }
    
    /**
     * Search bookings by text across multiple fields
     */
    public Page<Booking> searchBookings(String searchTerm, Pageable pageable) {
        Specification<Booking> specification = (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();
            
            if (searchTerm != null && !searchTerm.trim().isEmpty()) {
                String lowerSearchTerm = "%" + searchTerm.toLowerCase() + "%";
                
                // Search in user email
                predicates.add(criteriaBuilder.like(
                    criteriaBuilder.lower(root.get("user").get("email")), lowerSearchTerm));
                
                // Search in special requests
                predicates.add(criteriaBuilder.like(
                    criteriaBuilder.lower(root.get("specialRequests")), lowerSearchTerm));
                
                // Search by booking ID (if search term is numeric)
                try {
                    Long bookingId = Long.parseLong(searchTerm);
                    predicates.add(criteriaBuilder.equal(root.get("bookingId"), bookingId));
                } catch (NumberFormatException e) {
                    // Not a number, skip ID search
                }
                
                return criteriaBuilder.or(predicates.toArray(new Predicate[0]));
            }
            
            return criteriaBuilder.conjunction();
        };
        
        return bookingRepository.findAll(specification, pageable);
    }
    
    /**
     * Get booking statistics for dashboard
     */
    public BookingStatistics getBookingStatistics(LocalDate startDate, LocalDate endDate) {
        Specification<Booking> dateRangeSpec = (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();
            
            if (startDate != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(
                    root.get("visitDate").get("visitDate"), startDate));
            }
            
            if (endDate != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(
                    root.get("visitDate").get("visitDate"), endDate));
            }
            
            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
        
        List<Booking> bookings = bookingRepository.findAll(dateRangeSpec);
        
        return new BookingStatistics(bookings);
    }
    
    /**
     * Get upcoming bookings for notifications
     */
    public List<Booking> getUpcomingBookings(int daysAhead) {
        LocalDate tomorrow = LocalDate.now().plusDays(1);
        LocalDate targetDate = LocalDate.now().plusDays(daysAhead);
        
        Specification<Booking> upcomingSpec = (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();
            
            predicates.add(criteriaBuilder.greaterThanOrEqualTo(
                root.get("visitDate").get("visitDate"), tomorrow));
            
            predicates.add(criteriaBuilder.lessThanOrEqualTo(
                root.get("visitDate").get("visitDate"), targetDate));
            
            predicates.add(criteriaBuilder.equal(
                root.get("bookingStatus"), BookingStatus.APPROVED));
            
            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
        
        return bookingRepository.findAll(upcomingSpec);
    }
    
    /**
     * Get bookings pending approval for staff dashboard
     */
    public Page<Booking> getPendingBookings(Pageable pageable) {
        Specification<Booking> pendingSpec = (root, query, criteriaBuilder) -> 
            criteriaBuilder.equal(root.get("bookingStatus"), BookingStatus.PENDING);
        
        return bookingRepository.findAll(pendingSpec, pageable);
    }
}
