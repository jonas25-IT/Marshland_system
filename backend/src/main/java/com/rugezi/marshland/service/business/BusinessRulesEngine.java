package com.rugezi.marshland.service.business;

import com.rugezi.marshland.entity.Booking;
import com.rugezi.marshland.entity.BookingStatus;
import com.rugezi.marshland.entity.User;
import com.rugezi.marshland.entity.UserRole;
import com.rugezi.marshland.entity.VisitDate;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.Month;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Predicate;
import java.util.List;
import java.util.ArrayList;
import java.util.concurrent.ConcurrentHashMap;
import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
public class BusinessRulesEngine {
    
    // Business rule definitions
    private final Map<String, Predicate<RuleContext>> rules;
    
    // Advanced features
    private final Map<String, RuleMetrics> ruleMetrics;
    private final Map<String, Double> ruleWeights;
    private final List<BusinessRule> dynamicRules;
    
    // AI-powered recommendations cache
    private final Map<String, Recommendation> recommendationCache;
    
    public BusinessRulesEngine() {
        this.rules = new HashMap<>();
        this.ruleMetrics = new ConcurrentHashMap<>();
        this.ruleWeights = new ConcurrentHashMap<>();
        this.dynamicRules = new ArrayList<>();
        this.recommendationCache = new ConcurrentHashMap<>();
        initializeRules();
        initializeRuleWeights();
    }
    
    /**
     * Initialize all business rules
     */
    private void initializeRules() {
        // Booking rules
        rules.put("MAX_VISITORS_PER_BOOKING", this::maxVisitorsRule);
        rules.put("MIN_ADVANCE_BOOKING", this::minAdvanceBookingRule);
        rules.put("MAX_ADVANCE_BOOKING", this::maxAdvanceBookingRule);
        rules.put("CAPACITY_CHECK", this::capacityRule);
        rules.put("WEEKDAY_SURCHARGE", this::weekdaySurchargeRule);
        rules.put("WEEKEND_PREMIUM", this::weekendPremiumRule);
        rules.put("GROUP_DISCOUNT", this::groupDiscountRule);
        rules.put("RETURN_VISITOR_DISCOUNT", this::returnVisitorDiscountRule);
        
        // Approval rules
        rules.put("AUTO_APPROVE_SMALL_GROUPS", this::autoApproveSmallGroupsRule);
        rules.put("AUTO_APPROVE_ADVANCE", this::autoApproveAdvanceRule);
        rules.put("AUTO_REJECT_OVERCAPACITY", this::autoRejectOvercapacityRule);
        rules.put("REQUIRE_STAFF_APPROVAL_LARGE_GROUPS", this::requireStaffApprovalRule);
        
        // Pricing rules
        rules.put("BASE_PRICE_CALCULATION", this::basePriceRule);
        rules.put("SEASONAL_PRICING", this::seasonalPricingRule);
        rules.put("HOLIDAY_SURCHARGE", this::holidaySurchargeRule);
    }
    
    /**
     * Evaluate a specific rule
     */
    public RuleResult evaluateRule(String ruleName, RuleContext context) {
        Predicate<RuleContext> rule = rules.get(ruleName);
        if (rule == null) {
            return RuleResult.failure("Rule not found: " + ruleName);
        }
        
        try {
            boolean result = rule.test(context);
            return RuleResult.success(result);
        } catch (Exception e) {
            return RuleResult.failure("Error evaluating rule: " + e.getMessage());
        }
    }
    
    /**
     * Evaluate all applicable rules for a context
     */
    public RuleEvaluationResult evaluateAllRules(RuleContext context) {
        RuleEvaluationResult result = new RuleEvaluationResult();
        
        for (Map.Entry<String, Predicate<RuleContext>> entry : rules.entrySet()) {
            String ruleName = entry.getKey();
            Predicate<RuleContext> rule = entry.getValue();
            
            try {
                boolean ruleResult = rule.test(context);
                result.addRuleResult(ruleName, ruleResult, null);
            } catch (Exception e) {
                result.addRuleResult(ruleName, false, e.getMessage());
            }
        }
        
        return result;
    }
    
    // Individual rule implementations
    
    private boolean maxVisitorsRule(RuleContext context) {
        Integer maxVisitors = context.getParameter("maxVisitors", Integer.class);
        Integer requestedVisitors = context.getParameter("requestedVisitors", Integer.class);
        
        return requestedVisitors != null && requestedVisitors <= (maxVisitors != null ? maxVisitors : 20);
    }
    
    private boolean minAdvanceBookingRule(RuleContext context) {
        LocalDate visitDate = context.getParameter("visitDate", LocalDate.class);
        Integer minDays = context.getParameter("minDays", Integer.class);
        
        if (visitDate == null) return false;
        
        long daysUntilVisit = LocalDate.now().until(visitDate).getDays();
        return daysUntilVisit >= (minDays != null ? minDays : 1);
    }
    
    private boolean maxAdvanceBookingRule(RuleContext context) {
        LocalDate visitDate = context.getParameter("visitDate", LocalDate.class);
        Integer maxDays = context.getParameter("maxDays", Integer.class);
        
        if (visitDate == null) return false;
        
        long daysUntilVisit = LocalDate.now().until(visitDate).getDays();
        return daysUntilVisit <= (maxDays != null ? maxDays : 365);
    }
    
    private boolean capacityRule(RuleContext context) {
        VisitDate visitDate = context.getParameter("visitDateEntity", VisitDate.class);
        Integer requestedVisitors = context.getParameter("requestedVisitors", Integer.class);
        
        return visitDate != null && requestedVisitors != null && 
               visitDate.hasAvailableCapacity(requestedVisitors);
    }
    
    private boolean weekdaySurchargeRule(RuleContext context) {
        LocalDate visitDate = context.getParameter("visitDate", LocalDate.class);
        if (visitDate == null) return false;
        
        DayOfWeek dayOfWeek = visitDate.getDayOfWeek();
        return dayOfWeek == DayOfWeek.MONDAY || dayOfWeek == DayOfWeek.TUESDAY || 
               dayOfWeek == DayOfWeek.WEDNESDAY || dayOfWeek == DayOfWeek.THURSDAY || 
               dayOfWeek == DayOfWeek.FRIDAY;
    }
    
    private boolean weekendPremiumRule(RuleContext context) {
        LocalDate visitDate = context.getParameter("visitDate", LocalDate.class);
        if (visitDate == null) return false;
        
        DayOfWeek dayOfWeek = visitDate.getDayOfWeek();
        return dayOfWeek == DayOfWeek.SATURDAY || dayOfWeek == DayOfWeek.SUNDAY;
    }
    
    private boolean groupDiscountRule(RuleContext context) {
        Integer visitorCount = context.getParameter("visitorCount", Integer.class);
        return visitorCount != null && visitorCount >= 10;
    }
    
    private boolean returnVisitorDiscountRule(RuleContext context) {
        User user = context.getParameter("user", User.class);
        if (user == null) return false;
        
        // This would check if user has previous bookings
        // For now, return false as placeholder
        return false;
    }
    
    private boolean autoApproveSmallGroupsRule(RuleContext context) {
        Integer visitorCount = context.getParameter("visitorCount", Integer.class);
        return visitorCount != null && visitorCount <= 5;
    }
    
    private boolean autoApproveAdvanceRule(RuleContext context) {
        LocalDate visitDate = context.getParameter("visitDate", LocalDate.class);
        if (visitDate == null) return false;
        
        long daysUntilVisit = LocalDate.now().until(visitDate).getDays();
        return daysUntilVisit >= 30;
    }
    
    private boolean autoRejectOvercapacityRule(RuleContext context) {
        VisitDate visitDate = context.getParameter("visitDateEntity", VisitDate.class);
        Integer requestedVisitors = context.getParameter("requestedVisitors", Integer.class);
        
        return visitDate != null && requestedVisitors != null && 
               !visitDate.hasAvailableCapacity(requestedVisitors);
    }
    
    private boolean requireStaffApprovalRule(RuleContext context) {
        Integer visitorCount = context.getParameter("visitorCount", Integer.class);
        return visitorCount != null && visitorCount > 15;
    }
    
    private boolean basePriceRule(RuleContext context) {
        Integer visitorCount = context.getParameter("visitorCount", Integer.class);
        return visitorCount != null && visitorCount > 0;
    }
    
    private boolean seasonalPricingRule(RuleContext context) {
        LocalDate visitDate = context.getParameter("visitDate", LocalDate.class);
        if (visitDate == null) return false;
        
        int month = visitDate.getMonthValue();
        // Peak season: June-August (summer) and December-January (holidays)
        return (month >= 6 && month <= 8) || (month == 12 || month == 1);
    }
    
    private boolean holidaySurchargeRule(RuleContext context) {
        LocalDate visitDate = context.getParameter("visitDate", LocalDate.class);
        if (visitDate == null) return false;
        
        // This would check against a holiday calendar
        // For now, just check if it's a weekend
        DayOfWeek dayOfWeek = visitDate.getDayOfWeek();
        return dayOfWeek == DayOfWeek.SATURDAY || dayOfWeek == DayOfWeek.SUNDAY;
    }
    
    /**
     * Calculate pricing based on business rules
     */
    public PricingCalculation calculatePricing(RuleContext context) {
        PricingCalculation calculation = new PricingCalculation();
        
        // Base price
        Integer visitorCount = context.getParameter("visitorCount", Integer.class);
        if (visitorCount != null) {
            calculation.setBasePrice(visitorCount * 25.0); // $25 per visitor
        }
        
        // Apply weekend premium
        if (evaluateRule("WEEKEND_PREMIUM", context).isSuccess()) {
            calculation.setWeekendSurcharge(calculation.getBasePrice() * 0.2); // 20% surcharge
        }
        
        // Apply seasonal pricing
        if (evaluateRule("SEASONAL_PRICING", context).isSuccess()) {
            calculation.setSeasonalAdjustment(calculation.getBasePrice() * 0.15); // 15% seasonal
        }
        
        // Apply group discount
        if (evaluateRule("GROUP_DISCOUNT", context).isSuccess()) {
            calculation.setGroupDiscount(calculation.getBasePrice() * 0.1); // 10% discount
        }
        
        // Calculate final price
        calculation.calculateFinalPrice();
        
        return calculation;
    }
    
    /**
     * Get all available rules
     */
    public Map<String, String> getAvailableRules() {
        Map<String, String> ruleDescriptions = new HashMap<>();
        ruleDescriptions.put("MAX_VISITORS_PER_BOOKING", "Maximum visitors allowed per booking");
        ruleDescriptions.put("MIN_ADVANCE_BOOKING", "Minimum days required for advance booking");
        ruleDescriptions.put("MAX_ADVANCE_BOOKING", "Maximum days allowed for advance booking");
        ruleDescriptions.put("CAPACITY_CHECK", "Check if capacity is available");
        ruleDescriptions.put("WEEKDAY_SURCHARGE", "Apply weekday surcharge");
        ruleDescriptions.put("WEEKEND_PREMIUM", "Apply weekend premium pricing");
        ruleDescriptions.put("GROUP_DISCOUNT", "Apply group discount for 10+ visitors");
        ruleDescriptions.put("RETURN_VISITOR_DISCOUNT", "Apply discount for returning visitors");
        ruleDescriptions.put("AUTO_APPROVE_SMALL_GROUPS", "Auto-approve groups of 5 or less");
        ruleDescriptions.put("AUTO_APPROVE_ADVANCE", "Auto-approve bookings 30+ days in advance");
        ruleDescriptions.put("AUTO_REJECT_OVERCAPACITY", "Auto-reject if no capacity available");
        ruleDescriptions.put("REQUIRE_STAFF_APPROVAL_LARGE_GROUPS", "Require staff approval for 15+ visitors");
        ruleDescriptions.put("BASE_PRICE_CALCULATION", "Calculate base pricing");
        ruleDescriptions.put("SEASONAL_PRICING", "Apply seasonal pricing adjustments");
        ruleDescriptions.put("HOLIDAY_SURCHARGE", "Apply holiday surcharges");
        
        return ruleDescriptions;
    }
    
    // Inner classes for context and results
    
    public static class RuleContext {
        private final Map<String, Object> parameters = new HashMap<>();
        
        public void setParameter(String key, Object value) {
            parameters.put(key, value);
        }
        
        @SuppressWarnings("unchecked")
        public <T> T getParameter(String key, Class<T> type) {
            Object value = parameters.get(key);
            if (value == null) return null;
            
            if (type.isInstance(value)) {
                return (T) value;
            }
            
            throw new ClassCastException("Parameter " + key + " is not of type " + type.getSimpleName());
        }
        
        public boolean hasParameter(String key) {
            return parameters.containsKey(key);
        }
    }
    
    public static class RuleResult {
        private final boolean success;
        private final String message;
        
        private RuleResult(boolean success, String message) {
            this.success = success;
            this.message = message;
        }
        
        public static RuleResult success(boolean result) {
            return new RuleResult(true, null);
        }
        
        public static RuleResult failure(String message) {
            return new RuleResult(false, message);
        }
        
        public boolean isSuccess() { return success; }
        public String getMessage() { return message; }
    }
    
    public static class RuleEvaluationResult {
        private final Map<String, Boolean> ruleResults = new HashMap<>();
        private final Map<String, String> errors = new HashMap<>();
        
        public void addRuleResult(String ruleName, boolean result, String error) {
            ruleResults.put(ruleName, result);
            if (error != null) {
                errors.put(ruleName, error);
            }
        }
        
        public boolean getRuleResult(String ruleName) {
            return ruleResults.getOrDefault(ruleName, false);
        }
        
        public String getError(String ruleName) {
            return errors.get(ruleName);
        }
        
        public Map<String, Boolean> getAllResults() {
            return ruleResults;
        }
        
        public boolean hasErrors() {
            return !errors.isEmpty();
        }
    }
    
    public static class PricingCalculation {
        private double basePrice;
        private double weekendSurcharge;
        private double seasonalAdjustment;
        private double groupDiscount;
        private double finalPrice;
        
        // Getters and setters
        public double getBasePrice() { return basePrice; }
        public void setBasePrice(double basePrice) { this.basePrice = basePrice; }
        
        public double getWeekendSurcharge() { return weekendSurcharge; }
        public void setWeekendSurcharge(double weekendSurcharge) { this.weekendSurcharge = weekendSurcharge; }
        
        public double getSeasonalAdjustment() { return seasonalAdjustment; }
        public void setSeasonalAdjustment(double seasonalAdjustment) { this.seasonalAdjustment = seasonalAdjustment; }
        
        public double getGroupDiscount() { return groupDiscount; }
        public void setGroupDiscount(double groupDiscount) { this.groupDiscount = groupDiscount; }
        
        public double getFinalPrice() { return finalPrice; }
        
        public void calculateFinalPrice() {
            this.finalPrice = basePrice + weekendSurcharge + seasonalAdjustment - groupDiscount;
            this.finalPrice = Math.max(0, finalPrice); // Ensure non-negative
        }
        
        @Override
        public String toString() {
            return String.format(
                "PricingCalculation{base=$%.2f, weekendSurcharge=$%.2f, seasonal=$%.2f, discount=$%.2f, final=$%.2f}",
                basePrice, weekendSurcharge, seasonalAdjustment, groupDiscount, finalPrice
            );
        }
    }
    
    /**
     * Initialize rule weights for AI-powered optimization
     */
    private void initializeRuleWeights() {
        ruleWeights.put("MAX_VISITORS_PER_BOOKING", 1.0);
        ruleWeights.put("MIN_ADVANCE_BOOKING", 0.9);
        ruleWeights.put("MAX_ADVANCE_BOOKING", 0.8);
        ruleWeights.put("CAPACITY_CHECK", 1.0);
        ruleWeights.put("WEEKDAY_SURCHARGE", 0.7);
        ruleWeights.put("WEEKEND_PREMIUM", 0.7);
        ruleWeights.put("GROUP_DISCOUNT", 0.6);
        ruleWeights.put("RETURN_VISITOR_DISCOUNT", 0.5);
        ruleWeights.put("AUTO_APPROVE_SMALL_GROUPS", 0.9);
        ruleWeights.put("AUTO_APPROVE_ADVANCE", 0.8);
        ruleWeights.put("AUTO_REJECT_OVERCAPACITY", 1.0);
        ruleWeights.put("REQUIRE_STAFF_APPROVAL_LARGE_GROUPS", 0.9);
        ruleWeights.put("BASE_PRICE_CALCULATION", 1.0);
        ruleWeights.put("SEASONAL_PRICING", 0.8);
        ruleWeights.put("HOLIDAY_SURCHARGE", 0.7);
    }
    
    /**
     * Enhanced rule evaluation with metrics tracking
     */
    public RuleEvaluationResult evaluateRulesWithMetrics(List<String> ruleNames, RuleContext context) {
        RuleEvaluationResult result = new RuleEvaluationResult();
        
        for (String ruleName : ruleNames) {
            long startTime = System.nanoTime();
            RuleResult ruleResult = evaluateRule(ruleName, context);
            double executionTime = (System.nanoTime() - startTime) / 1_000_000.0; // Convert to milliseconds
            
            // Record metrics
            RuleMetrics metrics = ruleMetrics.computeIfAbsent(ruleName, RuleMetrics::new);
            metrics.recordExecution(ruleResult.isSuccess(), executionTime);
            
            result.addRuleResult(ruleName, ruleResult.isSuccess(), ruleResult.getMessage());
        }
        
        return result;
    }
    
    /**
     * Generate AI-powered recommendations based on current context
     */
    public List<Recommendation> generateRecommendations(RuleContext context) {
        List<Recommendation> recommendations = new ArrayList<>();
        String cacheKey = generateCacheKey(context);
        
        // Check cache first
        Recommendation cached = recommendationCache.get(cacheKey);
        if (cached != null && !cached.isExpired()) {
            recommendations.add(cached);
            return recommendations;
        }
        
        // Analyze context and generate recommendations
        analyzeAndGenerateRecommendations(context, recommendations);
        
        // Cache recommendations
        recommendations.forEach(rec -> recommendationCache.put(cacheKey, rec));
        
        return recommendations;
    }
    
    /**
     * Add dynamic business rule
     */
    public void addDynamicRule(BusinessRule rule) {
        dynamicRules.add(rule);
        // Sort by priority
        dynamicRules.sort((r1, r2) -> Integer.compare(r2.getPriority(), r1.getPriority()));
    }
    
    /**
     * Evaluate dynamic rules
     */
    public RuleEvaluationResult evaluateDynamicRules(RuleContext context) {
        RuleEvaluationResult result = new RuleEvaluationResult();
        
        for (BusinessRule rule : dynamicRules) {
            if (rule.isActive()) {
                long startTime = System.nanoTime();
                boolean ruleResult = rule.evaluate(context);
                double executionTime = (System.nanoTime() - startTime) / 1_000_000.0;
                
                // Record metrics
                RuleMetrics metrics = ruleMetrics.computeIfAbsent(rule.getId(), RuleMetrics::new);
                metrics.recordExecution(ruleResult, executionTime);
                
                result.addRuleResult(rule.getId(), ruleResult, null);
            }
        }
        
        return result;
    }
    
    /**
     * Get rule performance metrics
     */
    public Map<String, RuleMetrics> getRuleMetrics() {
        return new HashMap<>(ruleMetrics);
    }
    
    /**
     * Optimize rule weights based on performance metrics
     */
    public void optimizeRuleWeights() {
        for (Map.Entry<String, RuleMetrics> entry : ruleMetrics.entrySet()) {
            String ruleName = entry.getKey();
            RuleMetrics metrics = entry.getValue();
            
            // Adjust weight based on success rate and execution time
            double currentWeight = ruleWeights.getOrDefault(ruleName, 1.0);
            double successRate = metrics.getSuccessRate();
            double avgExecutionTime = metrics.getAverageExecutionTime();
            
            // Simple optimization: increase weight for successful, fast rules
            double optimizationFactor = (successRate / 100.0) * (1.0 / (1.0 + avgExecutionTime / 100.0));
            double newWeight = currentWeight * (0.8 + 0.4 * optimizationFactor); // Keep within 0.8-1.2 range
            
            ruleWeights.put(ruleName, Math.max(0.1, Math.min(2.0, newWeight)));
        }
    }
    
    /**
     * Get top performing rules
     */
    public List<String> getTopPerformingRules(int count) {
        return ruleMetrics.entrySet().stream()
            .sorted((e1, e2) -> Double.compare(e2.getValue().getSuccessRate(), e1.getValue().getSuccessRate()))
            .limit(count)
            .map(Map.Entry::getKey)
            .collect(ArrayList::new, ArrayList::add, ArrayList::addAll);
    }
    
    /**
     * Get rules that need attention (low success rate or slow execution)
     */
    public List<String> getRulesNeedingAttention() {
        return ruleMetrics.entrySet().stream()
            .filter(entry -> entry.getValue().getSuccessRate() < 80.0 || entry.getValue().getAverageExecutionTime() > 100.0)
            .map(Map.Entry::getKey)
            .collect(ArrayList::new, ArrayList::add, ArrayList::addAll);
    }
    
    // Helper methods
    private String generateCacheKey(RuleContext context) {
        return String.format("%s_%s_%s", 
            context.getParameter("visitorCount", Integer.class),
            context.getParameter("visitDate", LocalDate.class),
            context.getParameter("userRole", UserRole.class));
    }
    
    private void analyzeAndGenerateRecommendations(RuleContext context, List<Recommendation> recommendations) {
        Integer visitorCount = context.getParameter("visitorCount", Integer.class);
        LocalDate visitDate = context.getParameter("visitDate", LocalDate.class);
        
        if (visitorCount != null && visitDate != null) {
            // Pricing optimization recommendations
            if (visitorCount >= 10) {
                Map<String, Object> data = Map.of(
                    "visitorCount", visitorCount,
                    "recommendedDiscount", 15,
                    "potentialSavings", visitorCount * 25 * 0.15
                );
                recommendations.add(Recommendation.pricingOptimization(data, 0.85));
            }
            
            // Capacity optimization recommendations
            if (isPeakSeason(visitDate)) {
                Map<String, Object> data = Map.of(
                    "visitDate", visitDate,
                    "seasonType", "PEAK",
                    "recommendation", "Increase capacity or adjust pricing"
                );
                recommendations.add(Recommendation.capacityOptimization(data, 0.90));
            }
        }
    }
    
    private boolean isPeakSeason(LocalDate date) {
        Month month = date.getMonth();
        return month == Month.JUNE || month == Month.JULY || month == Month.AUGUST;
    }
}
