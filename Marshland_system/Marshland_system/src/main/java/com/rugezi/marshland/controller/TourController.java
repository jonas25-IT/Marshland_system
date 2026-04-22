package com.rugezi.marshland.controller;

import com.rugezi.marshland.entity.Tour;
import com.rugezi.marshland.service.TourService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tours")
@CrossOrigin(origins = "*", maxAge = 3600)
public class TourController {
    
    @Autowired
    private TourService tourService;
    
    @GetMapping
    public ResponseEntity<List<Tour>> getAllActiveTours() {
        return ResponseEntity.ok(tourService.getAllActiveTours());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Tour> getTourById(@PathVariable Long id) {
        return ResponseEntity.ok(tourService.getTourById(id));
    }
    
    @GetMapping("/category/{category}")
    public ResponseEntity<List<Tour>> getToursByCategory(@PathVariable String category) {
        return ResponseEntity.ok(tourService.getToursByCategory(category));
    }
    
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'ECOLOGIST')")
    public ResponseEntity<Tour> createTour(@RequestBody Tour tour) {
        return ResponseEntity.ok(tourService.createTour(tour));
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ECOLOGIST')")
    public ResponseEntity<Tour> updateTour(@PathVariable Long id, @RequestBody Tour tour) {
        return ResponseEntity.ok(tourService.updateTour(id, tour));
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ECOLOGIST')")
    public ResponseEntity<Void> deleteTour(@PathVariable Long id) {
        tourService.deleteTour(id);
        return ResponseEntity.ok().build();
    }
}
