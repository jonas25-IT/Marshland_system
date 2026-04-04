package com.rugezi.marshland.service.reporting;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * Data model for generated reports
 */
public class ReportData {
    private String title;
    private String period;
    private LocalDate generatedAt;
    private ReportingEngine.ReportFormat format;
    private Map<String, Object> summary;
    private List<Map<String, Object>> details;
    private Map<String, Object> charts;
    
    // Constructors
    public ReportData() {}
    
    public ReportData(String title, String period, LocalDate generatedAt, 
                    ReportingEngine.ReportFormat format, Map<String, Object> summary,
                    List<Map<String, Object>> details, Map<String, Object> charts) {
        this.title = title;
        this.period = period;
        this.generatedAt = generatedAt;
        this.format = format;
        this.summary = summary;
        this.details = details;
        this.charts = charts;
    }
    
    // Getters and setters
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    
    public String getPeriod() { return period; }
    public void setPeriod(String period) { this.period = period; }
    
    public LocalDate getGeneratedAt() { return generatedAt; }
    public void setGeneratedAt(LocalDate generatedAt) { this.generatedAt = generatedAt; }
    
    public ReportingEngine.ReportFormat getFormat() { return format; }
    public void setFormat(ReportingEngine.ReportFormat format) { this.format = format; }
    
    public Map<String, Object> getSummary() { return summary; }
    public void setSummary(Map<String, Object> summary) { this.summary = summary; }
    
    public List<Map<String, Object>> getDetails() { return details; }
    public void setDetails(List<Map<String, Object>> details) { this.details = details; }
    
    public Map<String, Object> getCharts() { return charts; }
    public void setCharts(Map<String, Object> charts) { this.charts = charts; }
}
