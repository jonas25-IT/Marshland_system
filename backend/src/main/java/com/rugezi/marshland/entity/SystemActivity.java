package com.rugezi.marshland.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "system_activities")
public class SystemActivity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String action; // LOGIN, LOGOUT, CREATE, UPDATE, DELETE, APPROVE, REJECT
    
    @Column(nullable = false)
    private String entityType; // USER, BOOKING, SPECIES, SPECIES_REPORT, etc.
    
    @Column(nullable = false)
    private String entityId; // ID of the affected entity
    
    @Column(nullable = false)
    private String entityName; // Human-readable name of the entity
    
    @Column(nullable = false)
    private String performedBy; // User who performed the action
    
    @Column(nullable = false)
    private String performedByRole; // Role of the user who performed the action
    
    @Column(columnDefinition = "TEXT")
    private String description; // Detailed description of the action
    
    @Column(columnDefinition = "TEXT")
    private String oldValue; // Previous value for updates
    
    @Column(columnDefinition = "TEXT")
    private String newValue; // New value for updates
    
    @Column(nullable = false)
    private LocalDateTime timestamp;
    
    @Column(nullable = false)
    private String ipAddress;
    
    @Column(nullable = false)
    private String userAgent;
    
    @Column(nullable = false)
    private Boolean success; // Whether the action was successful
    
    @Column(columnDefinition = "TEXT")
    private String errorMessage; // Error message if action failed
    
    // Constructors
    public SystemActivity() {}
    
    public SystemActivity(Long id, String action, String entityType, String entityId, String entityName, String performedBy, String performedByRole, String description, String oldValue, String newValue, LocalDateTime timestamp, String ipAddress, String userAgent, Boolean success, String errorMessage) {
        this.id = id;
        this.action = action;
        this.entityType = entityType;
        this.entityId = entityId;
        this.entityName = entityName;
        this.performedBy = performedBy;
        this.performedByRole = performedByRole;
        this.description = description;
        this.oldValue = oldValue;
        this.newValue = newValue;
        this.timestamp = timestamp;
        this.ipAddress = ipAddress;
        this.userAgent = userAgent;
        this.success = success;
        this.errorMessage = errorMessage;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }
    public String getEntityType() { return entityType; }
    public void setEntityType(String entityType) { this.entityType = entityType; }
    public String getEntityId() { return entityId; }
    public void setEntityId(String entityId) { this.entityId = entityId; }
    public String getEntityName() { return entityName; }
    public void setEntityName(String entityName) { this.entityName = entityName; }
    public String getPerformedBy() { return performedBy; }
    public void setPerformedBy(String performedBy) { this.performedBy = performedBy; }
    public String getPerformedByRole() { return performedByRole; }
    public void setPerformedByRole(String performedByRole) { this.performedByRole = performedByRole; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getOldValue() { return oldValue; }
    public void setOldValue(String oldValue) { this.oldValue = oldValue; }
    public String getNewValue() { return newValue; }
    public void setNewValue(String newValue) { this.newValue = newValue; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
    public String getIpAddress() { return ipAddress; }
    public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }
    public String getUserAgent() { return userAgent; }
    public void setUserAgent(String userAgent) { this.userAgent = userAgent; }
    public Boolean getSuccess() { return success; }
    public void setSuccess(Boolean success) { this.success = success; }
    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }
    
    @PrePersist
    protected void onCreate() {
        if (timestamp == null) {
            timestamp = LocalDateTime.now();
        }
    }
    
    // Static factory methods for common activities
    public static SystemActivity login(String userEmail, String userRole, String ipAddress, String userAgent, Boolean success) {
        SystemActivity activity = new SystemActivity();
        activity.setAction("LOGIN");
        activity.setEntityType("USER");
        activity.setEntityId(userEmail);
        activity.setEntityName(userEmail);
        activity.setPerformedBy(userEmail);
        activity.setPerformedByRole(userRole);
        activity.setDescription("User login attempt");
        activity.setIpAddress(ipAddress);
        activity.setUserAgent(userAgent);
        activity.setSuccess(success);
        activity.setErrorMessage(success ? null : "Login failed");
        return activity;
    }
    
    public static SystemActivity logout(String userEmail, String userRole, String ipAddress, String userAgent) {
        SystemActivity activity = new SystemActivity();
        activity.setAction("LOGOUT");
        activity.setEntityType("USER");
        activity.setEntityId(userEmail);
        activity.setEntityName(userEmail);
        activity.setPerformedBy(userEmail);
        activity.setPerformedByRole(userRole);
        activity.setDescription("User logout");
        activity.setIpAddress(ipAddress);
        activity.setUserAgent(userAgent);
        activity.setSuccess(true);
        return activity;
    }
    
    public static SystemActivity create(String entityType, String entityId, String entityName, 
                                       String performedBy, String performedByRole, String description) {
        SystemActivity activity = new SystemActivity();
        activity.setAction("CREATE");
        activity.setEntityType(entityType);
        activity.setEntityId(entityId);
        activity.setEntityName(entityName);
        activity.setPerformedBy(performedBy);
        activity.setPerformedByRole(performedByRole);
        activity.setDescription(description);
        activity.setSuccess(true);
        return activity;
    }
    
    public static SystemActivity update(String entityType, String entityId, String entityName, 
                                       String performedBy, String performedByRole, String description,
                                       String oldValue, String newValue) {
        SystemActivity activity = new SystemActivity();
        activity.setAction("UPDATE");
        activity.setEntityType(entityType);
        activity.setEntityId(entityId);
        activity.setEntityName(entityName);
        activity.setPerformedBy(performedBy);
        activity.setPerformedByRole(performedByRole);
        activity.setDescription(description);
        activity.setOldValue(oldValue);
        activity.setNewValue(newValue);
        activity.setSuccess(true);
        return activity;
    }
    
    public static SystemActivity delete(String entityType, String entityId, String entityName, 
                                       String performedBy, String performedByRole, String description) {
        SystemActivity activity = new SystemActivity();
        activity.setAction("DELETE");
        activity.setEntityType(entityType);
        activity.setEntityId(entityId);
        activity.setEntityName(entityName);
        activity.setPerformedBy(performedBy);
        activity.setPerformedByRole(performedByRole);
        activity.setDescription(description);
        activity.setSuccess(true);
        return activity;
    }
    
    public static SystemActivity bookingDecision(String bookingId, String bookingReference, 
                                                 String performedBy, String performedByRole, 
                                                 String decision, String reason) {
        SystemActivity activity = new SystemActivity();
        activity.setAction(decision); // APPROVE or REJECT
        activity.setEntityType("BOOKING");
        activity.setEntityId(bookingId);
        activity.setEntityName(bookingReference);
        activity.setPerformedBy(performedBy);
        activity.setPerformedByRole(performedByRole);
        activity.setDescription(String.format("Booking %s: %s", decision.toLowerCase(), reason));
        activity.setSuccess(true);
        return activity;
    }
}
