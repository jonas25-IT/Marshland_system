package com.rugezi.marshland.service.business;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * AI-powered recommendation for business decisions
 */
public class Recommendation {
    private String id;
    private String type;
    private String title;
    private String description;
    private double confidence;
    private Map<String, Object> data;
    private List<String> actions;
    private LocalDateTime generatedAt;
    private LocalDateTime expiresAt;
    private boolean applied;
    
    public Recommendation(String id, String type, String title, String description, 
                         double confidence, Map<String, Object> data, List<String> actions) {
        this.id = id;
        this.type = type;
        this.title = title;
        this.description = description;
        this.confidence = confidence;
        this.data = data;
        this.actions = actions;
        this.generatedAt = LocalDateTime.now();
        this.expiresAt = LocalDateTime.now().plusHours(24); // Default 24 hour expiry
        this.applied = false;
    }
    
    // Static factory methods for common recommendation types
    public static Recommendation pricingOptimization(Map<String, Object> data, double confidence) {
        return new Recommendation(
            "PRICING_OPT_" + System.currentTimeMillis(),
            "PRICING_OPTIMIZATION",
            "Pricing Optimization Opportunity",
            "Based on current booking patterns, consider adjusting pricing for better revenue optimization.",
            confidence,
            data,
            List.of("Review pricing settings", "Apply new pricing rules", "Monitor impact")
        );
    }
    
    public static Recommendation capacityOptimization(Map<String, Object> data, double confidence) {
        return new Recommendation(
            "CAPACITY_OPT_" + System.currentTimeMillis(),
            "CAPACITY_OPTIMIZATION",
            "Capacity Optimization Suggestion",
            "Current booking patterns suggest capacity adjustments could improve visitor experience.",
            confidence,
            data,
            List.of("Adjust capacity limits", "Update visit schedules", "Notify staff")
        );
    }
    
    public static Recommendation workflowOptimization(Map<String, Object> data, double confidence) {
        return new Recommendation(
            "WORKFLOW_OPT_" + System.currentTimeMillis(),
            "WORKFLOW_OPTIMIZATION",
            "Workflow Process Improvement",
            "Automated workflow adjustments could improve processing efficiency.",
            confidence,
            data,
            List.of("Update workflow rules", "Configure automation", "Test new workflow")
        );
    }
    
    // Getters and setters
    public String getId() { return id; }
    public String getType() { return type; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public double getConfidence() { return confidence; }
    public Map<String, Object> getData() { return data; }
    public List<String> getActions() { return actions; }
    public LocalDateTime getGeneratedAt() { return generatedAt; }
    public LocalDateTime getExpiresAt() { return expiresAt; }
    public boolean isApplied() { return applied; }
    public boolean isExpired() { return LocalDateTime.now().isAfter(expiresAt); }
    
    public void markAsApplied() {
        this.applied = true;
    }
    
    public void extendExpiry(int hours) {
        this.expiresAt = LocalDateTime.now().plusHours(hours);
    }
    
    @Override
    public String toString() {
        return String.format(
            "Recommendation{id='%s', type='%s', title='%s', confidence=%.2f, applied=%s, expired=%s}",
            id, type, title, confidence, applied, isExpired()
        );
    }
}
