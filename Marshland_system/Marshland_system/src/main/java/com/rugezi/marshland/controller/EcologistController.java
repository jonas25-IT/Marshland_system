package com.rugezi.marshland.controller;

import com.rugezi.marshland.entity.Species;
import com.rugezi.marshland.entity.User;
import com.rugezi.marshland.service.SpeciesService;
import com.rugezi.marshland.service.analytics.AnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ecologist")
@CrossOrigin(origins = "*", maxAge = 3600)
@PreAuthorize("hasAnyRole('ADMIN', 'ECOLOGIST')")
public class EcologistController {
    
    private final SpeciesService speciesService;
    private final AnalyticsService analyticsService;
    
    public EcologistController(SpeciesService speciesService, AnalyticsService analyticsService) {
        this.speciesService = speciesService;
        this.analyticsService = analyticsService;
    }
    
    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getEcologistDashboard(Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        Map<String, Object> dashboard = new HashMap<>();
        
        // Species management overview
        dashboard.put("totalSpecies", speciesService.getTotalSpeciesCount());
        dashboard.put("speciesByType", speciesService.getSpeciesCountByType());
        dashboard.put("mySpecies", speciesService.getSpeciesByCreatedBy(currentUser));
        
        // Conservation status overview
        Map<String, Object> conservationStatus = new HashMap<>();
        conservationStatus.put("endangered", speciesService.getSpeciesByConservationStatus("Endangered"));
        conservationStatus.put("vulnerable", speciesService.getSpeciesByConservationStatus("Vulnerable"));
        conservationStatus.put("leastConcern", speciesService.getSpeciesByConservationStatus("Least Concern"));
        dashboard.put("conservationStatus", conservationStatus);
        
        // Recent additions
        dashboard.put("recentSpecies", speciesService.getRecentSpecies(5));
        
        // Biodiversity analytics
        LocalDate today = LocalDate.now();
        LocalDate monthAgo = today.minusMonths(1);
        dashboard.put("biodiversityAnalytics", analyticsService.getVisitorAnalytics(monthAgo, today));
        
        return ResponseEntity.ok(dashboard);
    }
    
    // CREATE - Add new species
    @PostMapping
    @PreAuthorize("hasAnyRole('ECOLOGIST', 'ADMIN')")
    public ResponseEntity<?> createSpecies(@RequestBody Species species, Authentication authentication) {
        try {
            User currentUser = (User) authentication.getPrincipal();
            
            // Validation
            if (species.getScientificName() == null || species.getScientificName().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Scientific name is required"));
            }
            if (species.getCommonName() == null || species.getCommonName().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Common name is required"));
            }
            if (species.getType() == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Species type is required"));
            }
            if (species.getConservationStatus() == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Conservation status is required"));
            }
            
            Species createdSpecies = speciesService.createSpecies(species, currentUser);
            return ResponseEntity.ok(Map.of(
                "message", "Species created successfully",
                "species", createdSpecies
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to create species: " + e.getMessage()));
        }
    }
    
    @PutMapping("/species/{speciesId}")
    public ResponseEntity<?> updateSpecies(@PathVariable Long speciesId,
                                         @RequestBody Species species,
                                         Authentication authentication) {
        try {
            User currentUser = (User) authentication.getPrincipal();
            species.setSpeciesId(speciesId);
            Species updatedSpecies = speciesService.updateSpecies(species, currentUser);
            return ResponseEntity.ok(updatedSpecies);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @DeleteMapping("/species/{speciesId}")
    public ResponseEntity<?> deleteSpecies(@PathVariable Long speciesId, Authentication authentication) {
        try {
            User currentUser = (User) authentication.getPrincipal();
            speciesService.deleteSpecies(speciesId, currentUser);
            return ResponseEntity.ok(Map.of("message", "Species deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @GetMapping("/species/my-species")
    public ResponseEntity<List<Species>> getMySpecies(Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        List<Species> species = speciesService.getSpeciesByCreatedBy(currentUser);
        return ResponseEntity.ok(species);
    }
    
    @PostMapping("/species/{speciesId}/upload-image")
    public ResponseEntity<?> uploadSpeciesImage(@PathVariable Long speciesId, 
                                               @RequestParam("file") MultipartFile file,
                                               Authentication authentication) {
        try {
            User currentUser = (User) authentication.getPrincipal();
            String imageUrl = speciesService.uploadSpeciesImage(speciesId, file, currentUser);
            return ResponseEntity.ok(Map.of("imageUrl", imageUrl));
        } catch (IOException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to upload image: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @GetMapping("/reports/biodiversity")
    public ResponseEntity<Map<String, Object>> getBiodiversityReport() {
        Map<String, Object> report = new HashMap<>();
        
        report.put("speciesOverview", speciesService.getSpeciesStatistics());
        report.put("conservationStatus", Map.of(
            "endangered", speciesService.getSpeciesByConservationStatus("Endangered"),
            "vulnerable", speciesService.getSpeciesByConservationStatus("Vulnerable"),
            "leastConcern", speciesService.getSpeciesByConservationStatus("Least Concern")
        ));
        report.put("habitatDistribution", speciesService.getSpeciesByHabitat());
        report.put("typeDistribution", speciesService.getSpeciesCountByType());
        
        return ResponseEntity.ok(report);
    }
    
    @GetMapping("/reports/conservation")
    public ResponseEntity<Map<String, Object>> getConservationReport() {
        Map<String, Object> report = new HashMap<>();
        
        report.put("endangeredSpecies", speciesService.getSpeciesByConservationStatus("Endangered"));
        report.put("vulnerableSpecies", speciesService.getSpeciesByConservationStatus("Vulnerable"));
        report.put("conservationPriorities", speciesService.getConservationPriorities());
        
        return ResponseEntity.ok(report);
    }
    
    @GetMapping("/analytics/visitor-patterns")
    public ResponseEntity<Map<String, Object>> getVisitorPatterns() {
        Map<String, Object> patterns = new HashMap<>();
        
        patterns.put("peakSeasons", analyticsService.getPeakSeasons());
        patterns.put("popularSpecies", speciesService.getMostViewedSpecies());
        patterns.put("habitatInterest", analyticsService.getHabitatInterest());
        
        return ResponseEntity.ok(patterns);
    }
    
    @PostMapping("/research/upload")
    public ResponseEntity<?> uploadResearchData(@RequestParam("file") MultipartFile file,
                                               @RequestParam("title") String title,
                                               @RequestParam("description") String description,
                                               Authentication authentication) {
        try {
            User currentUser = (User) authentication.getPrincipal();
            // This would integrate with a research document service
            return ResponseEntity.ok(Map.of("message", "Research data uploaded successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
