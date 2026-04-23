package com.rugezi.marshland.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.extern.slf4j.Slf4j;
import java.time.LocalDateTime;

@Entity
@Table(name = "system_activities")
@Data
@Builder(toBuilder = true)
@NoArgsConstructor
@AllArgsConstructor
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
