package com.rugezi.marshland.repository;

import com.rugezi.marshland.entity.Species;
import com.rugezi.marshland.entity.SpeciesType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SpeciesRepository extends JpaRepository<Species, Long> {
    
    List<Species> findByType(SpeciesType type);
    
    List<Species> findByConservationStatus(String conservationStatus);
    
    @Query("SELECT s FROM Species s WHERE s.commonName LIKE %:keyword% OR s.scientificName LIKE %:keyword%")
    List<Species> findByKeyword(@Param("keyword") String keyword);
    
    @Query("SELECT s FROM Species s WHERE s.type = :type AND (s.commonName LIKE %:keyword% OR s.scientificName LIKE %:keyword%)")
    List<Species> findByTypeAndKeyword(@Param("type") SpeciesType type, @Param("keyword") String keyword);
    
    @Query("SELECT COUNT(s) FROM Species s WHERE s.type = :type")
    long countByType(@Param("type") SpeciesType type);
    
    @Query("SELECT DISTINCT s.conservationStatus FROM Species s WHERE s.conservationStatus IS NOT NULL")
    List<String> findDistinctConservationStatuses();
    
    Optional<Species> findByScientificName(String scientificName);
    
    boolean existsByScientificName(String scientificName);
    
    @Query("SELECT s FROM Species s WHERE " +
           "(:name IS NULL OR s.commonName LIKE %:name%) AND " +
           "(:habitat IS NULL OR s.habitat LIKE %:habitat%) AND " +
           "(:status IS NULL OR s.conservationStatus = :status)")
    List<Species> searchSpecies(@Param("name") String name, @Param("habitat") String habitat, @Param("status") String status);
    
    @Query("SELECT COUNT(s) FROM Species s WHERE " +
           "(:name IS NULL OR s.commonName LIKE %:name%) AND " +
           "(:habitat IS NULL OR s.habitat LIKE %:habitat%) AND " +
           "(:status IS NULL OR s.conservationStatus = :status)")
    long countSearchResults(@Param("name") String name, @Param("habitat") String habitat, @Param("status") String status);
    
    List<Species> findTop10ByOrderByViewsDesc();
    
    @Query("SELECT s.habitat, COUNT(s) FROM Species s GROUP BY s.habitat")
    List<Object[]> getHabitatStatistics();
}
