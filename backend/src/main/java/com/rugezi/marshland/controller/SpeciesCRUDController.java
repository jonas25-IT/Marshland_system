package com.rugezi.marshland.controller;

import com.rugezi.marshland.entity.Species;
import com.rugezi.marshland.entity.User;
import com.rugezi.marshland.service.SpeciesService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/species")
@CrossOrigin(origins = "*", maxAge = 3600)
public class SpeciesCRUDController {
    
    private final SpeciesService speciesService;
    
    public SpeciesCRUDController(SpeciesService speciesService) {
        this.speciesService = speciesService;
    }
    
    // CREATE - Add new species
    @PostMapping
    @PreAuthorize("hasAnyRole('ECOLOGIST', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> createSpecies(@RequestBody Species species, Authentication authentication) {
        try {
            User currentUser = (User) authentication.getPrincipal();
            
            // Validation
            Map<String, String> validationErrors = validateSpecies(species);
            if (!validationErrors.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "errors", validationErrors
                ));
            }
            
            Species createdSpecies = speciesService.createSpecies(species, currentUser);
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "success", true,
                "message", "Species created successfully",
                "data", createdSpecies
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "message", "Failed to create species: " + e.getMessage()
            ));
        }
    }
    
    // READ - Get all species with pagination
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllSpecies(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String conservationStatus) {
        try {
            Map<String, Object> result = speciesService.searchSpecies(name, type, conservationStatus, page, size);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", result
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "message", "Failed to fetch species: " + e.getMessage()
            ));
        }
    }
    
    // READ - Get species by ID
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getSpeciesById(@PathVariable Long id) {
        try {
            Optional<Species> species = speciesService.findById(id);
            if (species.isPresent()) {
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "data", species.get()
                ));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "success", false,
                    "message", "Species not found with id: " + id
                ));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "message", "Failed to fetch species: " + e.getMessage()
            ));
        }
    }
    
    // UPDATE - Update existing species
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ECOLOGIST', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> updateSpecies(@PathVariable Long id, @RequestBody Species species, Authentication authentication) {
        try {
            // Validation
            Map<String, String> validationErrors = validateSpecies(species);
            if (!validationErrors.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "errors", validationErrors
                ));
            }
            
            Species updatedSpecies = speciesService.updateSpecies(id, species, authentication);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Species updated successfully",
                "data", updatedSpecies
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "message", "Failed to update species: " + e.getMessage()
            ));
        }
    }
    
    // DELETE - Delete species (Admin only)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> deleteSpecies(@PathVariable Long id) {
        try {
            speciesService.deleteSpecies(id);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Species deleted successfully"
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "message", "Failed to delete species: " + e.getMessage()
            ));
        }
    }
    
    // SOFT DELETE - Deactivate species
    @PostMapping("/{id}/deactivate")
    @PreAuthorize("hasAnyRole('ECOLOGIST', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> deactivateSpecies(@PathVariable Long id, Authentication authentication) {
        try {
            speciesService.deactivateSpecies(id, authentication);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Species deactivated successfully"
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "message", "Failed to deactivate species: " + e.getMessage()
            ));
        }
    }
    
    // ACTIVATE - Reactivate species
    @PostMapping("/{id}/activate")
    @PreAuthorize("hasAnyRole('ECOLOGIST', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> activateSpecies(@PathVariable Long id, Authentication authentication) {
        try {
            speciesService.activateSpecies(id, authentication);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Species activated successfully"
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "message", "Failed to activate species: " + e.getMessage()
            ));
        }
    }
    
    // BULK OPERATIONS
    @PostMapping("/bulk")
    @PreAuthorize("hasAnyRole('ECOLOGIST', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> bulkCreateSpecies(@RequestBody List<Species> speciesList, Authentication authentication) {
        try {
            User currentUser = (User) authentication.getPrincipal();
            List<Species> createdSpecies = speciesService.bulkCreateSpecies(speciesList, currentUser);
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "success", true,
                "message", "Bulk species created successfully",
                "data", createdSpecies
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "message", "Failed to create bulk species: " + e.getMessage()
            ));
        }
    }
    
    @GetMapping("/statistics")
    @PreAuthorize("hasAnyRole('ECOLOGIST', 'ADMIN', 'STAFF')")
    public ResponseEntity<Map<String, Object>> getSpeciesStatistics() {
        try {
            Map<String, Object> statistics = speciesService.getSpeciesStatistics();
            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", statistics
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "message", "Failed to fetch statistics: " + e.getMessage()
            ));
        }
    }
    
    // FILE UPLOAD - Upload species image
    @PostMapping("/{id}/upload-image")
    @PreAuthorize("hasAnyRole('ECOLOGIST', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> uploadSpeciesImage(@PathVariable Long id, @RequestParam("file") MultipartFile file, Authentication authentication) {
        try {
            User currentUser = (User) authentication.getPrincipal();
            String imageUrl = speciesService.uploadSpeciesImage(id, file, currentUser);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Image uploaded successfully",
                "data", Map.of("imageUrl", imageUrl)
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "message", "Failed to upload image: " + e.getMessage()
            ));
        }
    }
    
    // Helper method for validation
    private Map<String, String> validateSpecies(Species species) {
        Map<String, String> errors = new HashMap<>();
        
        if (species.getScientificName() == null || species.getScientificName().trim().isEmpty()) {
            errors.put("scientificName", "Scientific name is required");
        }
        
        if (species.getCommonName() == null || species.getCommonName().trim().isEmpty()) {
            errors.put("commonName", "Common name is required");
        }
        
        if (species.getType() == null) {
            errors.put("type", "Species type is required");
        }
        
        if (species.getConservationStatus() == null) {
            errors.put("conservationStatus", "Conservation status is required");
        }
        
        if (species.getDescription() != null && species.getDescription().length() > 2000) {
            errors.put("description", "Description must be less than 2000 characters");
        }
        
        return errors;
    }
}
