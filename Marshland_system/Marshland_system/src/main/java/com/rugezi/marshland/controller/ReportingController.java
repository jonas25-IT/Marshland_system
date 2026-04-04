package com.rugezi.marshland.controller;

import com.rugezi.marshland.service.reporting.ReportData;
import com.rugezi.marshland.service.reporting.ReportingEngine;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

/**
 * Reporting Controller for generating and exporting comprehensive reports
 */
@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ReportingController {
    
    private final ReportingEngine reportingEngine;
    
    public ReportingController(ReportingEngine reportingEngine) {
        this.reportingEngine = reportingEngine;
    }
    
    /**
     * Generate booking report
     */
    @PostMapping("/booking")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<ReportData> generateBookingReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "PDF") ReportingEngine.ReportFormat format) {
        
        if (startDate == null) {
            startDate = LocalDate.now().minusMonths(1);
        }
        if (endDate == null) {
            endDate = LocalDate.now();
        }
        
        ReportData report = reportingEngine.generateBookingReport(startDate, endDate, format);
        return ResponseEntity.ok(report);
    }
    
    /**
     * Generate financial report
     */
    @PostMapping("/financial")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ReportData> generateFinancialReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "PDF") ReportingEngine.ReportFormat format) {
        
        if (startDate == null) {
            startDate = LocalDate.now().minusMonths(3);
        }
        if (endDate == null) {
            endDate = LocalDate.now();
        }
        
        ReportData report = reportingEngine.generateFinancialReport(startDate, endDate, format);
        return ResponseEntity.ok(report);
    }
    
    /**
     * Generate visitor analytics report
     */
    @PostMapping("/visitor")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<ReportData> generateVisitorReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "PDF") ReportingEngine.ReportFormat format) {
        
        if (startDate == null) {
            startDate = LocalDate.now().minusMonths(3);
        }
        if (endDate == null) {
            endDate = LocalDate.now();
        }
        
        ReportData report = reportingEngine.generateVisitorReport(startDate, endDate, format);
        return ResponseEntity.ok(report);
    }
    
    /**
     * Export booking report
     */
    @PostMapping("/booking/export")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<byte[]> exportBookingReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "PDF") ReportingEngine.ReportFormat format) throws Exception {
        
        if (startDate == null) {
            startDate = LocalDate.now().minusMonths(1);
        }
        if (endDate == null) {
            endDate = LocalDate.now();
        }
        
        ReportData report = reportingEngine.generateBookingReport(startDate, endDate, format);
        byte[] reportBytes = reportingEngine.exportReport(report);
        
        String filename = "booking_report_" + startDate + "_to_" + endDate + getFileExtension(format);
        
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
            .contentType(getMediaType(format))
            .body(reportBytes);
    }
    
    /**
     * Export financial report
     */
    @PostMapping("/financial/export")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<byte[]> exportFinancialReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "PDF") ReportingEngine.ReportFormat format) throws Exception {
        
        if (startDate == null) {
            startDate = LocalDate.now().minusMonths(3);
        }
        if (endDate == null) {
            endDate = LocalDate.now();
        }
        
        ReportData report = reportingEngine.generateFinancialReport(startDate, endDate, format);
        byte[] reportBytes = reportingEngine.exportReport(report);
        
        String filename = "financial_report_" + startDate + "_to_" + endDate + getFileExtension(format);
        
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
            .contentType(getMediaType(format))
            .body(reportBytes);
    }
    
    /**
     * Export visitor report
     */
    @PostMapping("/visitor/export")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<byte[]> exportVisitorReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "PDF") ReportingEngine.ReportFormat format) throws Exception {
        
        if (startDate == null) {
            startDate = LocalDate.now().minusMonths(3);
        }
        if (endDate == null) {
            endDate = LocalDate.now();
        }
        
        ReportData report = reportingEngine.generateVisitorReport(startDate, endDate, format);
        byte[] reportBytes = reportingEngine.exportReport(report);
        
        String filename = "visitor_report_" + startDate + "_to_" + endDate + getFileExtension(format);
        
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
            .contentType(getMediaType(format))
            .body(reportBytes);
    }
    
    /**
     * Get available report formats
     */
    @GetMapping("/formats")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<?> getAvailableFormats() {
        return ResponseEntity.ok(new ReportingEngine.ReportFormat[]{
            ReportingEngine.ReportFormat.PDF,
            ReportingEngine.ReportFormat.EXCEL,
            ReportingEngine.ReportFormat.CSV
        });
    }
    
    /**
     * Get report templates
     */
    @GetMapping("/templates")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getReportTemplates() {
        return ResponseEntity.ok(new String[]{
            "Standard Booking Report",
            "Financial Summary Report",
            "Visitor Analytics Report",
            "Custom Report Template"
        });
    }
    
    // Helper methods
    
    private String getFileExtension(ReportingEngine.ReportFormat format) {
        switch (format) {
            case PDF:
                return ".pdf";
            case EXCEL:
                return ".xlsx";
            case CSV:
                return ".csv";
            default:
                return ".txt";
        }
    }
    
    private MediaType getMediaType(ReportingEngine.ReportFormat format) {
        switch (format) {
            case PDF:
                return MediaType.APPLICATION_PDF;
            case EXCEL:
                return MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            case CSV:
                return MediaType.parseMediaType("text/csv");
            default:
                return MediaType.TEXT_PLAIN;
        }
    }
}
