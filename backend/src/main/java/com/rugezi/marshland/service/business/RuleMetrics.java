package com.rugezi.marshland.service.business;

import java.time.LocalDateTime;
import java.util.concurrent.atomic.AtomicLong;
import java.util.concurrent.atomic.AtomicReference;

/**
 * Metrics and performance tracking for business rules
 */
public class RuleMetrics {
    private final String ruleName;
    private final AtomicLong executionCount;
    private final AtomicLong successCount;
    private final AtomicLong failureCount;
    private final AtomicReference<LocalDateTime> lastExecuted;
    private final AtomicReference<Double> averageExecutionTime;
    private final AtomicReference<Double> successRate;
    
    public RuleMetrics(String ruleName) {
        this.ruleName = ruleName;
        this.executionCount = new AtomicLong(0);
        this.successCount = new AtomicLong(0);
        this.failureCount = new AtomicLong(0);
        this.lastExecuted = new AtomicReference<>(LocalDateTime.now());
        this.averageExecutionTime = new AtomicReference<>(0.0);
        this.successRate = new AtomicReference<>(0.0);
    }
    
    public void recordExecution(boolean success, double executionTimeMs) {
        executionCount.incrementAndGet();
        lastExecuted.set(LocalDateTime.now());
        
        if (success) {
            successCount.incrementAndGet();
        } else {
            failureCount.incrementAndGet();
        }
        
        // Update average execution time
        double currentAvg = averageExecutionTime.get();
        long count = executionCount.get();
        double newAvg = (currentAvg * (count - 1) + executionTimeMs) / count;
        averageExecutionTime.set(newAvg);
        
        // Update success rate
        long successes = successCount.get();
        double newSuccessRate = (double) successes / count * 100;
        successRate.set(newSuccessRate);
    }
    
    // Getters
    public String getRuleName() { return ruleName; }
    public long getExecutionCount() { return executionCount.get(); }
    public long getSuccessCount() { return successCount.get(); }
    public long getFailureCount() { return failureCount.get(); }
    public LocalDateTime getLastExecuted() { return lastExecuted.get(); }
    public double getAverageExecutionTime() { return averageExecutionTime.get(); }
    public double getSuccessRate() { return successRate.get(); }
    
    @Override
    public String toString() {
        return String.format(
            "RuleMetrics{name='%s', executions=%d, successRate=%.2f%%, avgTime=%.2fms}",
            ruleName, getExecutionCount(), getSuccessRate(), getAverageExecutionTime()
        );
    }
}
