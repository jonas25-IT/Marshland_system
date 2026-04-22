package com.rugezi.marshland.repository;

import com.rugezi.marshland.entity.GalleryPhoto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface GalleryPhotoRepository extends JpaRepository<GalleryPhoto, Long> {

    // Find all photos with custom query to avoid lazy loading issues
    @Query("SELECT gp FROM GalleryPhoto gp LEFT JOIN FETCH gp.uploadedBy ORDER BY gp.uploadDate DESC")
    List<GalleryPhoto> findAllByOrderByUploadDateDesc();

    // Find photos by category
    List<GalleryPhoto> findByCategoryOrderByUploadDateDesc(String category);

    // Find photos by uploader
    List<GalleryPhoto> findByUploadedByUserIdOrderByUploadDateDesc(Long userId);
    
    // Search photos by title or description
    @Query("SELECT gp FROM GalleryPhoto gp WHERE " +
           "(LOWER(gp.title) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(gp.description) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(gp.category) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(gp.fileName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(gp.contentType) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) " +
           "ORDER BY gp.uploadDate DESC")
    List<GalleryPhoto> searchPhotos(@Param("searchTerm") String searchTerm);
    
    // Find photos uploaded in date range
    @Query("SELECT gp FROM GalleryPhoto gp WHERE gp.uploadDate BETWEEN :startDate AND :endDate " +
           "ORDER BY gp.uploadDate DESC")
    List<GalleryPhoto> findPhotosInDateRange(@Param("startDate") LocalDateTime startDate, 
                                           @Param("endDate") LocalDateTime endDate);
    
    // Find recent photos (last 30 days)
    @Query("SELECT gp FROM GalleryPhoto gp WHERE gp.uploadDate >= :thirtyDaysAgo " +
           "ORDER BY gp.uploadDate DESC")
    List<GalleryPhoto> findRecentPhotos(@Param("thirtyDaysAgo") LocalDateTime thirtyDaysAgo);
    
    // Count photos by category
    long countByCategory(String category);
}
