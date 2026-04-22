package com.rugezi.marshland.service;

import com.rugezi.marshland.entity.Species;
import com.rugezi.marshland.entity.SpeciesType;
import com.rugezi.marshland.entity.User;
import com.rugezi.marshland.repository.SpeciesRepository;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@Transactional
public class SpeciesService {
    
    private final SpeciesRepository speciesRepository;
    
    public SpeciesService(SpeciesRepository speciesRepository) {
        this.speciesRepository = speciesRepository;
    }
    
    public Species createSpecies(Species species, User createdBy) {
        if (speciesRepository.existsByScientificName(species.getScientificName())) {
            throw new RuntimeException("Species with scientific name already exists: " + species.getScientificName());
        }
        
        species.setCreatedBy(createdBy);
        return speciesRepository.save(species);
    }
    
    public Species updateSpecies(Long id, Species speciesDetails) {
        Species species = findById(id)
            .orElseThrow(() -> new RuntimeException("Species not found with id: " + id));
        
        species.setCommonName(speciesDetails.getCommonName());
        species.setType(speciesDetails.getType());
        species.setConservationStatus(speciesDetails.getConservationStatus());
        species.setDescription(speciesDetails.getDescription());
        species.setHabitat(speciesDetails.getHabitat());
        species.setImageUrl(speciesDetails.getImageUrl());
        
        return speciesRepository.save(species);
    }
    
    public void deleteSpecies(Long id) {
        Species species = findById(id)
            .orElseThrow(() -> new RuntimeException("Species not found with id: " + id));
        speciesRepository.delete(species);
    }
    
    public void deactivateSpecies(Long id, Authentication authentication) {
        Species species = findById(id)
            .orElseThrow(() -> new RuntimeException("Species not found with id: " + id));
        
        User currentUser = (User) authentication.getPrincipal();
        
        // Check if user can deactivate (ecologist and admin can deactivate any species)
        if (!currentUser.getRole().name().equals("ADMIN") && 
            !currentUser.getRole().name().equals("ECOLOGIST") &&
            !species.getCreatedBy().getUserId().equals(currentUser.getUserId())) {
            throw new RuntimeException("You can only deactivate your own species");
        }
        
        species.setActive(false);
        speciesRepository.save(species);
    }
    
    public Species updateSpecies(Long id, Species speciesDetails, Authentication authentication) {
        Species species = findById(id)
            .orElseThrow(() -> new RuntimeException("Species not found with id: " + id));
        
        User currentUser = (User) authentication.getPrincipal();
        
        // Check if user can update (ecologist and admin can update any species)
        if (!currentUser.getRole().name().equals("ADMIN") && 
            !currentUser.getRole().name().equals("ECOLOGIST") &&
            !species.getCreatedBy().getUserId().equals(currentUser.getUserId())) {
            throw new RuntimeException("You can only update your own species");
        }
        
        species.setCommonName(speciesDetails.getCommonName());
        species.setType(speciesDetails.getType());
        species.setConservationStatus(speciesDetails.getConservationStatus());
        species.setDescription(speciesDetails.getDescription());
        species.setHabitat(speciesDetails.getHabitat());
        species.setImageUrl(speciesDetails.getImageUrl());
        
        return speciesRepository.save(species);
    }
    
    public Map<String, Object> searchSpecies(String name, String type, String conservationStatus, int page, int size) {
        List<Species> species = speciesRepository.searchSpecies(name, type, conservationStatus);
        Map<String, Object> result = new HashMap<>();
        result.put("species", species);
        result.put("currentPage", page);
        result.put("pageSize", size);
        result.put("totalElements", speciesRepository.countSearchResults(name, type, conservationStatus));
        return result;
    }
    
    public Map<String, Object> getSpeciesStatistics() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalSpecies", getTotalSpeciesCount());
        stats.put("speciesByType", getSpeciesCountByType());
        stats.put("speciesByConservationStatus", Map.of(
            "endangered", getSpeciesByConservationStatus("Endangered"),
            "vulnerable", getSpeciesByConservationStatus("Vulnerable"),
            "leastConcern", getSpeciesByConservationStatus("Least Concern")
        ));
        stats.put("speciesByHabitat", getSpeciesByHabitat());
        stats.put("conservationPriorities", getConservationPriorities());
        return stats;
    }
    
    public List<Species> getMostViewedSpecies() {
        return speciesRepository.findTop10ByOrderByViewsDesc();
    }
    
    public Map<String, Object> getHabitatInterest() {
        List<Object[]> habitatData = speciesRepository.getHabitatStatistics();
        Map<String, Object> result = new HashMap<>();
        result.put("habitats", habitatData);
        result.put("totalHabitats", habitatData.size());
        return result;
    }
    
    // RBAC specific methods
    public Species updateSpecies(Species species, User updatedBy) {
        Species existingSpecies = getSpeciesById(species.getSpeciesId());
        existingSpecies.setCommonName(species.getCommonName());
        existingSpecies.setScientificName(species.getScientificName());
        existingSpecies.setDescription(species.getDescription());
        existingSpecies.setHabitat(species.getHabitat());
        existingSpecies.setConservationStatus(species.getConservationStatus());
        existingSpecies.setType(species.getType());
        existingSpecies.setImageUrl(species.getImageUrl());
        return speciesRepository.save(existingSpecies);
    }
    
    public void deleteSpecies(Long speciesId, User user) {
        Species species = getSpeciesById(speciesId);
        // Check if user owns the species or is admin
        if (!species.getCreatedBy().getUserId().equals(user.getUserId()) && 
            !user.getRole().name().equals("ADMIN")) {
            throw new RuntimeException("You don't have permission to delete this species");
        }
        speciesRepository.deleteById(speciesId);
    }
    
    public List<Species> getSpeciesByCreatedBy(User user) {
        return speciesRepository.findAll().stream()
                .filter(s -> s.getCreatedBy() != null && s.getCreatedBy().getUserId().equals(user.getUserId()))
                .toList();
    }
    
    @org.springframework.beans.factory.annotation.Value("${app.upload.dir}")
    private String uploadDir;

    public String uploadSpeciesImage(Long speciesId, MultipartFile file, User user) throws IOException {
        Species species = getSpeciesById(speciesId);
        
        // Ensure directory exists
        java.io.File directory = new java.io.File(uploadDir);
        if (!directory.exists()) {
            directory.mkdirs();
        }

        // Generate unique filename
        String originalFilename = file.getOriginalFilename();
        // Remove spaces and special characters from filename for web compatibility
        String sanitizedFilename = originalFilename != null ? originalFilename.replaceAll("[^a-zA-Z0-9.]", "_") : "image.jpg";
        String fileName = speciesId + "_" + System.currentTimeMillis() + "_" + sanitizedFilename;
        java.nio.file.Path filePath = java.nio.file.Paths.get(uploadDir, fileName);
        
        // Save file
        java.nio.file.Files.copy(file.getInputStream(), filePath, java.nio.file.StandardCopyOption.REPLACE_EXISTING);

        // Update species record with the retrievable URL
        String imageUrl = "http://localhost:8083/uploads/species/" + fileName;
        species.setImageUrl(imageUrl);
        speciesRepository.save(species);
        
        return imageUrl;
    }
    
    public List<Species> getAllSpecies() {
        return speciesRepository.findAll();
    }
    
    public long getTotalSpeciesCount() {
        return speciesRepository.count();
    }
    
    public Map<String, Long> getSpeciesCountByType() {
        Map<String, Long> counts = new HashMap<>();
        List<Species> allSpecies = speciesRepository.findAll();
        for (Species species : allSpecies) {
            String type = species.getType() != null ? species.getType().toString() : "UNKNOWN";
            counts.put(type, counts.getOrDefault(type, 0L) + 1);
        }
        return counts;
    }
    
    public List<Species> getSpeciesByConservationStatus(String status) {
        return speciesRepository.findAll().stream()
                .filter(s -> status.equals(s.getConservationStatus()))
                .toList();
    }
    
    public Map<String, Long> getSpeciesByHabitat() {
        Map<String, Long> counts = new HashMap<>();
        List<Species> allSpecies = speciesRepository.findAll();
        for (Species species : allSpecies) {
            String habitat = species.getHabitat() != null ? species.getHabitat() : "UNKNOWN";
            counts.put(habitat, counts.getOrDefault(habitat, 0L) + 1);
        }
        return counts;
    }
    
    public List<Species> getFeaturedSpecies(int limit) {
        return speciesRepository.findAll().stream()
                .filter(s -> s.getImageUrl() != null && !s.getImageUrl().isEmpty())
                .limit(limit)
                .toList();
    }
    
    public List<Species> getRecentSpecies(int limit) {
        return speciesRepository.findAll().stream()
                .sorted((s1, s2) -> s2.getCreatedAt().compareTo(s1.getCreatedAt()))
                .limit(limit)
                .toList();
    }
    
    public Map<String, Object> getConservationPriorities() {
        Map<String, Object> priorities = new HashMap<>();
        priorities.put("byHabitat", getSpeciesByHabitat());
        priorities.put("endangered", getSpeciesByConservationStatus("Endangered").size());
        return priorities;
    }
    
    public Optional<Species> findById(Long id) {
        return speciesRepository.findById(id);
    }
    
    public Species getSpeciesById(Long id) {
        return speciesRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Species not found with id: " + id));
    }
    
    public List<Species> findAll() {
        return speciesRepository.findAll();
    }
    
    public List<Species> findByType(SpeciesType type) {
        return speciesRepository.findByType(type);
    }
    
    public List<Species> findByConservationStatus(String conservationStatus) {
        return speciesRepository.findByConservationStatus(conservationStatus);
    }
    
    public List<Species> searchByKeyword(String keyword) {
        return speciesRepository.findByKeyword(keyword);
    }
    
    public List<Species> searchByTypeAndKeyword(SpeciesType type, String keyword) {
        return speciesRepository.findByTypeAndKeyword(type, keyword);
    }
    
    public long countByType(SpeciesType type) {
        return speciesRepository.countByType(type);
    }
    
    public List<String> getDistinctConservationStatuses() {
        return speciesRepository.findDistinctConservationStatuses();
    }
    
    public long countSearchResults(String name, String habitat, String status) {
        return speciesRepository.countSearchResults(name, habitat, status);
    }
    
    public void activateSpecies(Long id, Authentication authentication) {
        Species species = getSpeciesById(id);
        species.setActive(true);
        speciesRepository.save(species);
    }
    
    public List<Species> bulkCreateSpecies(List<Species> speciesList, User user) {
        for (Species species : speciesList) {
            species.setCreatedBy(user);
        }
        return speciesRepository.saveAll(speciesList);
    }
    
    public Optional<Species> findByScientificName(String scientificName) {
        return speciesRepository.findByScientificName(scientificName);
    }
    
    public boolean existsByScientificName(String scientificName) {
        return speciesRepository.existsByScientificName(scientificName);
    }
}
