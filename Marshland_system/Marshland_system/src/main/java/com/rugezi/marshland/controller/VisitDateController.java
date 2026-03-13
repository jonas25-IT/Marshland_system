package com.rugezi.marshland.controller;

import com.rugezi.marshland.entity.VisitDate;
import com.rugezi.marshland.service.VisitDateService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/visit-dates")
public class VisitDateController {
    
    private final VisitDateService visitDateService;
    
    public VisitDateController(VisitDateService visitDateService) {
        this.visitDateService = visitDateService;
    }
    
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public VisitDate createVisitDate(@RequestBody VisitDate visitDate) {
        return visitDateService.createVisitDate(visitDate);
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public VisitDate updateVisitDate(@PathVariable Long id, @RequestBody VisitDate visitDate) {
        return visitDateService.updateVisitDate(id, visitDate);
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteVisitDate(@PathVariable Long id) {
        visitDateService.deleteVisitDate(id);
    }
    
    @GetMapping
    public List<VisitDate> getAllVisitDates() {
        return visitDateService.findAll();
    }
    
    @GetMapping("/upcoming")
    public List<VisitDate> getUpcomingVisitDates() {
        return visitDateService.findUpcomingDates();
    }
    
    @GetMapping("/available")
    public List<VisitDate> getAvailableDates(@RequestParam(defaultValue = "1") Integer visitors) {
        return visitDateService.findAvailableDates(visitors);
    }
    
    @GetMapping("/search")
    public VisitDate getVisitDate(@RequestParam String date) {
        return visitDateService.findByVisitDate(LocalDate.parse(date));
    }
}
