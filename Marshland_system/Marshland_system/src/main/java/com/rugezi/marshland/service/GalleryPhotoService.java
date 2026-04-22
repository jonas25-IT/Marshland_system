package com.rugezi.marshland.service;

import com.rugezi.marshland.entity.GalleryPhoto;
import com.rugezi.marshland.entity.User;
import com.rugezi.marshland.repository.GalleryPhotoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@Service
@Transactional
public class GalleryPhotoService {
    
    @Autowired
    private GalleryPhotoRepository galleryPhotoRepository;
    
    // CREATE - Add new photo
    public GalleryPhoto createPhoto(GalleryPhoto photo, User uploadedBy) {
        photo.setUploadedBy(uploadedBy);
        photo.setUploadDate(LocalDateTime.now());
        photo.setLastUpdated(LocalDateTime.now());
        return galleryPhotoRepository.save(photo);
    }
    
    // READ - Get all photos
    public List<GalleryPhoto> getAllPhotos() {
        try {
            return galleryPhotoRepository.findAllByOrderByUploadDateDesc();
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to fetch photos: " + e.getMessage(), e);
        }
    }
    
    // READ - Get photo by ID
    public GalleryPhoto getPhotoById(Long photoId) {
        return galleryPhotoRepository.findById(photoId)
                .orElseThrow(() -> new RuntimeException("Photo not found with id: " + photoId));
    }
    
    // READ - Get photos by category
    public List<GalleryPhoto> getPhotosByCategory(String category) {
        return galleryPhotoRepository.findByCategoryOrderByUploadDateDesc(category);
    }
    
    // READ - Get photos uploaded by user
    public List<GalleryPhoto> getPhotosByUser(Long userId) {
        return galleryPhotoRepository.findByUploadedByUserIdOrderByUploadDateDesc(userId);
    }
    
    // READ - Search photos
    public List<GalleryPhoto> searchPhotos(String searchTerm) {
        if (searchTerm == null || searchTerm.trim().isEmpty()) {
            return getAllPhotos();
        }
        return galleryPhotoRepository.searchPhotos(searchTerm);
    }
    
    // READ - Get recent photos (last 30 days)
    public List<GalleryPhoto> getRecentPhotos() {
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        return galleryPhotoRepository.findRecentPhotos(thirtyDaysAgo);
    }
    
    // UPDATE - Update photo
    public GalleryPhoto updatePhoto(Long photoId, GalleryPhoto photoDetails) {
        GalleryPhoto existingPhoto = getPhotoById(photoId);
        
        if (photoDetails.getTitle() != null) {
            existingPhoto.setTitle(photoDetails.getTitle());
        }
        if (photoDetails.getDescription() != null) {
            existingPhoto.setDescription(photoDetails.getDescription());
        }
        if (photoDetails.getImageUrl() != null) {
            existingPhoto.setImageUrl(photoDetails.getImageUrl());
        }
        if (photoDetails.getCategory() != null) {
            existingPhoto.setCategory(photoDetails.getCategory());
        }
        if (photoDetails.getContentType() != null) {
            existingPhoto.setContentType(photoDetails.getContentType());
        }
        if (photoDetails.getFileName() != null) {
            existingPhoto.setFileName(photoDetails.getFileName());
        }
        if (photoDetails.getFileSize() != null) {
            existingPhoto.setFileSize(photoDetails.getFileSize());
        }
        
        existingPhoto.setLastUpdated(LocalDateTime.now());
        
        return galleryPhotoRepository.save(existingPhoto);
    }
    
    // DELETE - Permanent delete
    public void deletePhoto(Long photoId) {
        GalleryPhoto photo = getPhotoById(photoId);
        galleryPhotoRepository.delete(photo);
    }
    
    // UTILITY - Get photo statistics
    public Map<String, Object> getPhotoStatistics() {
        Map<String, Object> stats = new HashMap<>();
        
        List<GalleryPhoto> allPhotos = getAllPhotos();
        stats.put("totalPhotos", allPhotos.size());
        
        // Count by categories
        Map<String, Long> categoryCounts = new HashMap<>();
        for (GalleryPhoto photo : allPhotos) {
            categoryCounts.put(photo.getCategory(), 
                categoryCounts.getOrDefault(photo.getCategory(), 0L) + 1);
        }
        stats.put("categoryCounts", categoryCounts);
        
        // Recent uploads (last 7 days)
        LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);
        long recentUploads = allPhotos.stream()
                .filter(photo -> photo.getUploadDate().isAfter(sevenDaysAgo))
                .count();
        stats.put("recentUploads", recentUploads);
        
        return stats;
    }
    
    // UTILITY - Get all categories
    public List<String> getAllCategories() {
        return galleryPhotoRepository.findAll().stream()
                .map(GalleryPhoto::getCategory)
                .distinct()
                .sorted()
                .toList();
    }
}
