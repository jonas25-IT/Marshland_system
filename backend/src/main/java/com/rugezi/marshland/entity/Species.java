package com.rugezi.marshland.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "species")
@EntityListeners(AuditingEntityListener.class)
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "createdBy"})
public class Species {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "species_id")
    private Long speciesId;
    
    @Column(name = "scientific_name", unique = true, nullable = false)
    private String scientificName;
    
    @Column(name = "common_name", nullable = false)
    private String commonName;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SpeciesType type;
    
    @Column(name = "conservation_status")
    private String conservationStatus;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    private String habitat;
    
    @Column(name = "image_url")
    private String imageUrl;
    
    @Column(name = "views")
    private Integer views = 0;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    @JsonIgnore
    private User createdBy;
    
    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    @Column(name = "last_updated")
    private LocalDateTime lastUpdated;
    
    // Constructors
    public Species() {}
    
    public Species(String scientificName, String commonName, SpeciesType type, User createdBy) {
        this.scientificName = scientificName;
        this.commonName = commonName;
        this.type = type;
        this.createdBy = createdBy;
    }
    
    // Getters and Setters
    public Long getSpeciesId() { return speciesId; }
    public void setSpeciesId(Long speciesId) { this.speciesId = speciesId; }
    
    public String getScientificName() { return scientificName; }
    public void setScientificName(String scientificName) { this.scientificName = scientificName; }
    
    public String getCommonName() { return commonName; }
    public void setCommonName(String commonName) { this.commonName = commonName; }
    
    public SpeciesType getType() { return type; }
    public void setType(SpeciesType type) { this.type = type; }
    
    public String getConservationStatus() { return conservationStatus; }
    public void setConservationStatus(String conservationStatus) { this.conservationStatus = conservationStatus; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public String getHabitat() { return habitat; }
    public void setHabitat(String habitat) { this.habitat = habitat; }
    
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    
    public int getViews() { return views != null ? views : 0; }
    public void setViews(Integer views) { this.views = views; }
    
    public User getCreatedBy() { return createdBy; }
    public void setCreatedBy(User createdBy) { this.createdBy = createdBy; }
    
    @Column(name = "is_active")
    private Boolean active = true;
    
    public boolean isActive() { return active != null ? active : true; }
    public void setActive(Boolean active) { this.active = active; }
    
    @JsonProperty("createdBy")
    public String getCreatorName() { 
        return createdBy != null ? createdBy.getFirstName() + " " + createdBy.getLastName() : "Unknown"; 
    }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getLastUpdated() { return lastUpdated; }
    public void setLastUpdated(LocalDateTime lastUpdated) { this.lastUpdated = lastUpdated; }
}
