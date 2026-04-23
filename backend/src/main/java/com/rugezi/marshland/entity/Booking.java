package com.rugezi.marshland.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "booking")
@EntityListeners(AuditingEntityListener.class)
public class Booking {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "booking_id")
    private Long bookingId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "date_id", nullable = false)
    private VisitDate visitDate;
    
    @Min(value = 1, message = "At least 1 visitor is required")
    @Max(value = 20, message = "Maximum 20 visitors allowed per booking")
    @NotNull(message = "Number of visitors is required")
    @Column(name = "number_of_visitors", nullable = false)
    private Integer numberOfVisitors;
    
    @CreatedDate
    @Column(name = "booking_date", updatable = false)
    private LocalDateTime bookingDate;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BookingStatus bookingStatus = BookingStatus.PENDING;
    
    @Column(columnDefinition = "TEXT", name = "special_requests")
    private String specialRequests;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by")
    private User approvedBy;
    
    @Column(name = "approval_date")
    private LocalDateTime approvalDate;
    
    // Constructors
    public Booking() {}
    
    public Booking(User user, VisitDate visitDate, Integer numberOfVisitors) {
        this.user = user;
        this.visitDate = visitDate;
        this.numberOfVisitors = numberOfVisitors;
    }
    
    // Getters and Setters
    public Long getBookingId() { return bookingId; }
    public void setBookingId(Long bookingId) { this.bookingId = bookingId; }
    
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    
    public VisitDate getVisitDate() { return visitDate; }
    public void setVisitDate(VisitDate visitDate) { this.visitDate = visitDate; }
    
    public Integer getNumberOfVisitors() { return numberOfVisitors; }
    public void setNumberOfVisitors(Integer numberOfVisitors) { this.numberOfVisitors = numberOfVisitors; }
    
    public LocalDateTime getBookingDate() { return bookingDate; }
    public void setBookingDate(LocalDateTime bookingDate) { this.bookingDate = bookingDate; }
    
    public BookingStatus getBookingStatus() { return bookingStatus; }
    public void setBookingStatus(BookingStatus bookingStatus) { this.bookingStatus = bookingStatus; }
    
    public String getSpecialRequests() { return specialRequests; }
    public void setSpecialRequests(String specialRequests) { this.specialRequests = specialRequests; }
    
    public User getApprovedBy() { return approvedBy; }
    public void setApprovedBy(User approvedBy) { this.approvedBy = approvedBy; }
    
    public LocalDateTime getApprovalDate() { return approvalDate; }
    public void setApprovalDate(LocalDateTime approvalDate) { this.approvalDate = approvalDate; }
    
    // Alias for bookingDate to match controller expectations
    public LocalDateTime getCreatedAt() { return bookingDate; }
    
    public void approve(User admin) {
        this.bookingStatus = BookingStatus.APPROVED;
        this.approvedBy = admin;
        this.approvalDate = LocalDateTime.now();
    }
    
    public void reject(User admin) {
        this.bookingStatus = BookingStatus.REJECTED;
        this.approvedBy = admin;
        this.approvalDate = LocalDateTime.now();
    }
}
