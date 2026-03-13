package com.rugezi.marshland.controller;

import com.rugezi.marshland.entity.Species;
import com.rugezi.marshland.entity.SpeciesType;
import com.rugezi.marshland.entity.User;
import com.rugezi.marshland.service.SpeciesService;
import com.rugezi.marshland.service.UserService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/species")
public class SpeciesController {
    
    private final SpeciesService speciesService;
    private final UserService userService;
    
    public SpeciesController(SpeciesService speciesService, UserService userService) {
        this.speciesService = speciesService;
        this.userService = userService;
    }
    
    @GetMapping
    public List<Species> listSpecies(@RequestParam(required = false) String keyword,
                                    @RequestParam(required = false) SpeciesType type) {
        if (keyword != null && !keyword.trim().isEmpty()) {
            if (type != null) {
                return speciesService.searchByTypeAndKeyword(type, keyword);
            } else {
                return speciesService.searchByKeyword(keyword);
            }
        } else if (type != null) {
            return speciesService.findByType(type);
        } else {
            return speciesService.findAll();
        }
    }
    
    @GetMapping("/{id}")
    public Species viewSpecies(@PathVariable Long id) {
        return speciesService.getSpeciesById(id);
    }
    
    @PostMapping
    @PreAuthorize("hasAnyRole('ECOLOGIST', 'ADMIN')")
    public Species createSpecies(@RequestBody Species species, Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        return speciesService.createSpecies(species, currentUser);
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ECOLOGIST', 'ADMIN')")
    public Species updateSpecies(@PathVariable Long id, @RequestBody Species species) {
        return speciesService.updateSpecies(id, species);
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteSpecies(@PathVariable Long id) {
        speciesService.deleteSpecies(id);
    }
    
    @GetMapping("/types")
    public SpeciesType[] getSpeciesTypes() {
        return SpeciesType.values();
    }
    
    @GetMapping("/conservation-statuses")
    public List<String> getConservationStatuses() {
        return speciesService.getDistinctConservationStatuses();
    }
}
