package com.rugezi.marshland.service;

import com.rugezi.marshland.entity.Species;
import com.rugezi.marshland.entity.SpeciesType;
import com.rugezi.marshland.entity.User;
import com.rugezi.marshland.repository.SpeciesRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
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
