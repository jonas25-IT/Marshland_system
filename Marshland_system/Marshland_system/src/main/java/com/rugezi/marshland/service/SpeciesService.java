package com.rugezi.marshland.service;

import com.rugezi.marshland.entity.Species;
import com.rugezi.marshland.entity.SpeciesType;
import com.rugezi.marshland.entity.User;
import com.rugezi.marshland.repository.SpeciesRepository;
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
        if (!speciesRepository.existsById(id)) {
            throw new RuntimeException("Species not found with id: " + id);
        }
        speciesRepository.deleteById(id);
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
    
    public String uploadSpeciesImage(Long speciesId, MultipartFile file, User user) throws IOException {
        Species species = getSpeciesById(speciesId);
        // This would integrate with a file storage service
        // For now, return a placeholder URL
        String imageUrl = "/uploads/species/" + speciesId + "_" + file.getOriginalFilename();
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
    
    public List<Species> getMostViewedSpecies() {
        // This would integrate with view tracking
        return getFeaturedSpecies(5);
    }
    
    public List<Species> getConservationPriorities() {
        return getSpeciesByConservationStatus("Endangered");
    }
    
    public Map<String, Object> getSpeciesStatistics() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("total", getTotalSpeciesCount());
        stats.put("byType", getSpeciesCountByType());
        stats.put("byHabitat", getSpeciesByHabitat());
        stats.put("endangered", getSpeciesByConservationStatus("Endangered").size());
        return stats;
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
    
    public Optional<Species> findByScientificName(String scientificName) {
        return speciesRepository.findByScientificName(scientificName);
    }
    
    public boolean existsByScientificName(String scientificName) {
        return speciesRepository.existsByScientificName(scientificName);
    }
}
