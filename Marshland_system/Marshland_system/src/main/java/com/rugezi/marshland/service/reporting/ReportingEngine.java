package com.rugezi.marshland.service.reporting;

import com.rugezi.marshland.entity.Booking;
import com.rugezi.marshland.entity.BookingStatus;
import com.rugezi.marshland.repository.BookingRepository;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Advanced Reporting Engine for generating comprehensive reports with PDF and Excel export capabilities
 */
@Service
public class ReportingEngine {
    
    private final BookingRepository bookingRepository;
    
    public ReportingEngine(BookingRepository bookingRepository) {
        this.bookingRepository = bookingRepository;
    }
    
    /**
     * Generate booking report
     */
    public ReportData generateBookingReport(LocalDate startDate, LocalDate endDate, ReportFormat format) {
        List<Booking> bookings = bookingRepository.findByVisitDateVisitDateBetween(startDate, endDate);
        
        ReportData report = new ReportData();
        report.setTitle("Booking Report");
        report.setPeriod(startDate + " to " + endDate);
        report.setGeneratedAt(LocalDate.now());
        report.setFormat(format);
        
        // Summary statistics
        Map<String, Object> summary = new HashMap<>();
        summary.put("totalBookings", bookings.size());
        summary.put("approvedBookings", bookings.stream().mapToInt(b -> b.getBookingStatus() == BookingStatus.APPROVED ? 1 : 0).sum());
        summary.put("pendingBookings", bookings.stream().mapToInt(b -> b.getBookingStatus() == BookingStatus.PENDING ? 1 : 0).sum());
        summary.put("rejectedBookings", bookings.stream().mapToInt(b -> b.getBookingStatus() == BookingStatus.REJECTED ? 1 : 0).sum());
        summary.put("totalVisitors", bookings.stream().filter(b -> b.getBookingStatus() == BookingStatus.APPROVED).mapToInt(Booking::getNumberOfVisitors).sum());
        summary.put("totalRevenue", calculateTotalRevenue(bookings));
        report.setSummary(summary);
        
        // Detailed data
        List<Map<String, Object>> details = bookings.stream()
            .map(this::bookingToMap)
            .collect(Collectors.toList());
        report.setDetails(details);
        
        // Charts data
        Map<String, Object> charts = generateChartsData(bookings);
        report.setCharts(charts);
        
        return report;
    }
    
    /**
     * Generate financial report
     */
    public ReportData generateFinancialReport(LocalDate startDate, LocalDate endDate, ReportFormat format) {
        List<Booking> bookings = bookingRepository.findByVisitDateVisitDateBetween(startDate, endDate);
        List<Booking> approvedBookings = bookings.stream()
            .filter(b -> b.getBookingStatus() == BookingStatus.APPROVED)
            .collect(Collectors.toList());
        
        ReportData report = new ReportData();
        report.setTitle("Financial Report");
        report.setPeriod(startDate + " to " + endDate);
        report.setGeneratedAt(LocalDate.now());
        report.setFormat(format);
        
        // Financial summary
        Map<String, Object> summary = new HashMap<>();
        BigDecimal totalRevenue = calculateTotalRevenue(approvedBookings);
        summary.put("totalRevenue", totalRevenue);
        summary.put("totalBookings", approvedBookings.size());
        summary.put("averageRevenuePerBooking", approvedBookings.isEmpty() ? BigDecimal.ZERO : 
            totalRevenue.divide(BigDecimal.valueOf(approvedBookings.size()), 2, RoundingMode.HALF_UP));
        summary.put("totalVisitors", approvedBookings.stream().mapToInt(Booking::getNumberOfVisitors).sum());
        summary.put("averageRevenuePerVisitor", approvedBookings.stream().mapToInt(Booking::getNumberOfVisitors).sum() > 0 ? 
            totalRevenue.divide(BigDecimal.valueOf(approvedBookings.stream().mapToInt(Booking::getNumberOfVisitors).sum()), 2, RoundingMode.HALF_UP) : 
            BigDecimal.ZERO);
        report.setSummary(summary);
        
        // Revenue by month
        Map<String, BigDecimal> revenueByMonth = approvedBookings.stream()
            .collect(Collectors.groupingBy(
                booking -> booking.getVisitDate().getVisitDate().format(DateTimeFormatter.ofPattern("MMM yyyy")),
                Collectors.mapping(
                    booking -> BigDecimal.valueOf(booking.getNumberOfVisitors() * 25.0),
                    Collectors.reducing(BigDecimal.ZERO, BigDecimal::add)
                )
            ));
        summary.put("revenueByMonth", revenueByMonth);
        
        // Detailed financial data
        List<Map<String, Object>> details = approvedBookings.stream()
            .map(this::bookingToFinancialMap)
            .collect(Collectors.toList());
        report.setDetails(details);
        
        return report;
    }
    
    /**
     * Generate visitor analytics report
     */
    public ReportData generateVisitorReport(LocalDate startDate, LocalDate endDate, ReportFormat format) {
        List<Booking> bookings = bookingRepository.findByVisitDateVisitDateBetween(startDate, endDate);
        List<Booking> approvedBookings = bookings.stream()
            .filter(b -> b.getBookingStatus() == BookingStatus.APPROVED)
            .collect(Collectors.toList());
        
        ReportData report = new ReportData();
        report.setTitle("Visitor Analytics Report");
        report.setPeriod(startDate + " to " + endDate);
        report.setGeneratedAt(LocalDate.now());
        report.setFormat(format);
        
        // Visitor summary
        Map<String, Object> summary = new HashMap<>();
        summary.put("totalVisitors", approvedBookings.stream().mapToInt(Booking::getNumberOfVisitors).sum());
        summary.put("uniqueVisitors", (int) approvedBookings.stream().map(b -> b.getUser().getUserId()).distinct().count());
        summary.put("averageGroupSize", approvedBookings.isEmpty() ? 0.0 : 
            approvedBookings.stream().mapToInt(Booking::getNumberOfVisitors).average().orElse(0.0));
        summary.put("totalBookings", approvedBookings.size());
        
        // Group size distribution
        Map<String, Long> groupSizeDistribution = approvedBookings.stream()
            .collect(Collectors.groupingBy(
                booking -> {
                    int size = booking.getNumberOfVisitors();
                    if (size <= 2) return "Small (1-2)";
                    if (size <= 5) return "Medium (3-5)";
                    if (size <= 10) return "Large (6-10)";
                    return "Extra Large (11+)";
                },
                Collectors.counting()
            ));
        summary.put("groupSizeDistribution", groupSizeDistribution);
        
        report.setSummary(summary);
        
        // Detailed visitor data
        List<Map<String, Object>> details = approvedBookings.stream()
            .map(this::bookingToVisitorMap)
            .collect(Collectors.toList());
        report.setDetails(details);
        
        return report;
    }
    
    /**
     * Export report to byte array
     */
    public byte[] exportReport(ReportData report) throws IOException {
        switch (report.getFormat()) {
            case PDF:
                return generatePDF(report);
            case EXCEL:
                return generateExcel(report);
            case CSV:
                return generateCSV(report);
            default:
                throw new IllegalArgumentException("Unsupported format: " + report.getFormat());
        }
    }
    
    // Helper methods
    
    private BigDecimal calculateTotalRevenue(List<Booking> bookings) {
        return bookings.stream()
            .filter(booking -> booking.getBookingStatus() == BookingStatus.APPROVED)
            .map(booking -> BigDecimal.valueOf(booking.getNumberOfVisitors() * 25.0))
            .reduce(BigDecimal.ZERO, BigDecimal::add)
            .setScale(2, RoundingMode.HALF_UP);
    }
    
    private Map<String, Object> bookingToMap(Booking booking) {
        Map<String, Object> map = new HashMap<>();
        map.put("bookingId", booking.getBookingId());
        map.put("userEmail", booking.getUser().getEmail());
        map.put("visitDate", booking.getVisitDate().getVisitDate());
        map.put("numberOfVisitors", booking.getNumberOfVisitors());
        map.put("status", booking.getBookingStatus());
        map.put("bookingDate", booking.getBookingDate());
        map.put("specialRequests", booking.getSpecialRequests());
        if (booking.getApprovedBy() != null) {
            map.put("approvedBy", booking.getApprovedBy().getEmail());
        }
        return map;
    }
    
    private Map<String, Object> bookingToFinancialMap(Booking booking) {
        Map<String, Object> map = bookingToMap(booking);
        map.put("revenue", BigDecimal.valueOf(booking.getNumberOfVisitors() * 25.0));
        map.put("pricePerVisitor", BigDecimal.valueOf(25.0));
        return map;
    }
    
    private Map<String, Object> bookingToVisitorMap(Booking booking) {
        Map<String, Object> map = new HashMap<>();
        map.put("bookingId", booking.getBookingId());
        map.put("userEmail", booking.getUser().getEmail());
        map.put("userRole", booking.getUser().getRole());
        map.put("visitDate", booking.getVisitDate().getVisitDate());
        map.put("numberOfVisitors", booking.getNumberOfVisitors());
        map.put("groupSizeCategory", getGroupSizeCategory(booking.getNumberOfVisitors()));
        map.put("bookingDate", booking.getBookingDate());
        return map;
    }
    
    private String getGroupSizeCategory(int numberOfVisitors) {
        if (numberOfVisitors <= 2) return "Small (1-2)";
        if (numberOfVisitors <= 5) return "Medium (3-5)";
        if (numberOfVisitors <= 10) return "Large (6-10)";
        return "Extra Large (11+)";
    }
    
    private Map<String, Object> generateChartsData(List<Booking> bookings) {
        Map<String, Object> charts = new HashMap<>();
        
        // Status distribution
        Map<String, Long> statusDistribution = bookings.stream()
            .collect(Collectors.groupingBy(
                booking -> booking.getBookingStatus().toString(),
                Collectors.counting()
            ));
        charts.put("statusDistribution", statusDistribution);
        
        // Monthly trends
        Map<String, Long> monthlyTrends = bookings.stream()
            .collect(Collectors.groupingBy(
                booking -> booking.getVisitDate().getVisitDate().format(DateTimeFormatter.ofPattern("MMM yyyy")),
                Collectors.counting()
            ));
        charts.put("monthlyTrends", monthlyTrends);
        
        return charts;
    }
    
    private byte[] generatePDF(ReportData report) throws IOException {
        // This would use a PDF library like iText or PDFBox
        // For now, return a placeholder
        String content = "PDF Report: " + report.getTitle() + "\n" +
                       "Period: " + report.getPeriod() + "\n" +
                       "Generated: " + report.getGeneratedAt() + "\n" +
                       "Summary: " + report.getSummary();
        return content.getBytes();
    }
    
    private byte[] generateExcel(ReportData report) throws IOException {
        // This would use Apache POI for Excel generation
        // For now, return a placeholder CSV
        return generateCSV(report);
    }
    
    private byte[] generateCSV(ReportData report) throws IOException {
        StringBuilder csv = new StringBuilder();
        
        // Header
        csv.append(report.getTitle()).append("\n");
        csv.append("Period: ").append(report.getPeriod()).append("\n");
        csv.append("Generated: ").append(report.getGeneratedAt()).append("\n\n");
        
        // Summary
        csv.append("SUMMARY\n");
        for (Map.Entry<String, Object> entry : report.getSummary().entrySet()) {
            csv.append(entry.getKey()).append(",").append(entry.getValue()).append("\n");
        }
        
        csv.append("\nDETAILS\n");
        if (!report.getDetails().isEmpty()) {
            // Get headers from first detail
            Map<String, Object> firstDetail = report.getDetails().get(0);
            csv.append(String.join(",", firstDetail.keySet())).append("\n");
            
            // Add data rows
            for (Map<String, Object> detail : report.getDetails()) {
                csv.append(String.join(",", detail.values().stream().map(Object::toString).collect(Collectors.toList()))).append("\n");
            }
        }
        
        return csv.toString().getBytes();
    }
    
    public enum ReportFormat {
        PDF, EXCEL, CSV
    }
}
