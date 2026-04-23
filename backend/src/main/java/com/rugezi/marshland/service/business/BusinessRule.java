package com.rugezi.marshland.service.business;

import java.time.LocalDateTime;
import java.util.function.Predicate;

/**
 * Dynamic business rule with metadata and lifecycle management
 */
public class BusinessRule {
    private String id;
    private String name;
    private String description;
    private Predicate<BusinessRulesEngine.RuleContext> condition;
    private boolean active;
    private double weight;
    private LocalDateTime createdAt;
    private LocalDateTime lastModified;
    private String category;
    private int priority;
    
    public BusinessRule(String id, String name, String description, 
                       Predicate<BusinessRulesEngine.RuleContext> condition, 
                       String category, int priority) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.condition = condition;
        this.category = category;
        this.priority = priority;
        this.active = true;
        this.weight = 1.0;
        this.createdAt = LocalDateTime.now();
        this.lastModified = LocalDateTime.now();
    }
    
    public boolean evaluate(BusinessRulesEngine.RuleContext context) {
        if (!active) {
            return false;
        }
        
        try {
            return condition.test(context);
        } catch (Exception e) {
            // Log error and return false for safety
            System.err.println("Error evaluating rule " + id + ": " + e.getMessage());
            return false;
        }
    }
    
    // Builder pattern for easy rule creation
    public static BusinessRuleBuilder builder() {
        return new BusinessRuleBuilder();
    }
    
    // Getters and setters
    public String getId() { return id; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { 
        this.active = active; 
        this.lastModified = LocalDateTime.now();
    }
    public double getWeight() { return weight; }
    public void setWeight(double weight) { 
        this.weight = weight; 
        this.lastModified = LocalDateTime.now();
    }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getLastModified() { return lastModified; }
    public String getCategory() { return category; }
    public int getPriority() { return priority; }
    
    @Override
    public String toString() {
        return String.format(
            "BusinessRule{id='%s', name='%s', category='%s', priority=%d, active=%s, weight=%.2f}",
            id, name, category, priority, active, weight
        );
    }
    
    /**
     * Builder class for BusinessRule
     */
    public static class BusinessRuleBuilder {
        private String id;
        private String name;
        private String description;
        private Predicate<BusinessRulesEngine.RuleContext> condition;
        private String category;
        private int priority;
        
        public BusinessRuleBuilder id(String id) {
            this.id = id;
            return this;
        }
        
        public BusinessRuleBuilder name(String name) {
            this.name = name;
            return this;
        }
        
        public BusinessRuleBuilder description(String description) {
            this.description = description;
            return this;
        }
        
        public BusinessRuleBuilder condition(Predicate<BusinessRulesEngine.RuleContext> condition) {
            this.condition = condition;
            return this;
        }
        
        public BusinessRuleBuilder category(String category) {
            this.category = category;
            return this;
        }
        
        public BusinessRuleBuilder priority(int priority) {
            this.priority = priority;
            return this;
        }
        
        public BusinessRule build() {
            return new BusinessRule(id, name, description, condition, category, priority);
        }
    }
}
