package com.rugezi.marshland.service.filtering;

import com.rugezi.marshland.entity.BookingStatus;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public class BookingFilterCriteria {
    
    private Long userId;
    private BookingStatus status;
    private List<BookingStatus> statuses;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private LocalDate visitStartDate;
    private LocalDate visitEndDate;
    private Integer minVisitors;
    private Integer maxVisitors;
    private Long approvedById;
    private String specialRequests;
    private String userEmail;
    
    // Constructors
    public BookingFilterCriteria() {}
    
    // Getters and Setters
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    
    public BookingStatus getStatus() { return status; }
    public void setStatus(BookingStatus status) { this.status = status; }
    
    public List<BookingStatus> getStatuses() { return statuses; }
    public void setStatuses(List<BookingStatus> statuses) { this.statuses = statuses; }
    
    public LocalDateTime getStartDate() { return startDate; }
    public void setStartDate(LocalDateTime startDate) { this.startDate = startDate; }
    
    public LocalDateTime getEndDate() { return endDate; }
    public void setEndDate(LocalDateTime endDate) { this.endDate = endDate; }
    
    public LocalDate getVisitStartDate() { return visitStartDate; }
    public void setVisitStartDate(LocalDate visitStartDate) { this.visitStartDate = visitStartDate; }
    
    public LocalDate getVisitEndDate() { return visitEndDate; }
    public void setVisitEndDate(LocalDate visitEndDate) { this.visitEndDate = visitEndDate; }
    
    public Integer getMinVisitors() { return minVisitors; }
    public void setMinVisitors(Integer minVisitors) { this.minVisitors = minVisitors; }
    
    public Integer getMaxVisitors() { return maxVisitors; }
    public void setMaxVisitors(Integer maxVisitors) { this.maxVisitors = maxVisitors; }
    
    public Long getApprovedById() { return approvedById; }
    public void setApprovedById(Long approvedById) { this.approvedById = approvedById; }
    
    public String getSpecialRequests() { return specialRequests; }
    public void setSpecialRequests(String specialRequests) { this.specialRequests = specialRequests; }
    
    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }
}
