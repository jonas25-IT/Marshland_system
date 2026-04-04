package com.rugezi.marshland.service;

import com.rugezi.marshland.entity.Photo;
import com.rugezi.marshland.entity.User;
import com.rugezi.marshland.repository.PhotoRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@Service
public class PhotoService {
    
    private final PhotoRepository photoRepository;
    
    @Value("${app.upload.dir:uploads}")
    private String uploadDir;
    
    public PhotoService(PhotoRepository photoRepository) {
        this.photoRepository = photoRepository;
    }
    
    public List<Photo> getAllPhotos() {
        return photoRepository.findAllByOrderByUploadDateDesc();
    }
    
    public List<Photo> getPhotosByCategory(String category) {
        return photoRepository.findByCategoryOrderByUploadDateDesc(category);
    }
    
    public List<Photo> getPhotosByUser(User user) {
        return photoRepository.findByUploadedByOrderByUploadDateDesc(user);
    }
    
    public Photo getPhotoById(Long photoId) {
        return photoRepository.findById(photoId)
                .orElseThrow(() -> new RuntimeException("Photo not found with id: " + photoId));
    }
    
    public Photo uploadPhoto(MultipartFile file, String title, String description, 
                          String category, User uploadedBy) throws IOException {
        // Create upload directory if it doesn't exist
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
        
        // Generate unique filename
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null) {
            originalFilename = "unknown";
        }
        String extension = originalFilename.contains(".") ? 
            originalFilename.substring(originalFilename.lastIndexOf(".")) : "";
        String newFilename = UUID.randomUUID().toString() + extension;
        
        // Save file
        Path filePath = uploadPath.resolve(newFilename);
        Files.copy(file.getInputStream(), filePath);
        
        // Create photo entity
        Photo photo = new Photo();
        photo.setTitle(title);
        photo.setDescription(description);
        photo.setCategory(category);
        photo.setImageUrl("/uploads/" + newFilename);
        photo.setFileName(originalFilename);
        photo.setContentType(file.getContentType());
        photo.setFileSize(file.getSize());
        photo.setUploadedBy(uploadedBy);
        
        return photoRepository.save(photo);
    }
    
    public void deletePhoto(Long photoId, User user) {
        Photo photo = getPhotoById(photoId);
        
        // Check if user owns the photo or is admin
        if (!photo.getUploadedBy().getUserId().equals(user.getUserId()) && 
            !user.getRole().name().equals("ADMIN")) {
            throw new RuntimeException("You don't have permission to delete this photo");
        }
        
        // Delete file from filesystem
        try {
            Path filePath = Paths.get(uploadDir, photo.getImageUrl().replace("/uploads/", ""));
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            // Log error but continue with database deletion
            System.err.println("Error deleting file: " + e.getMessage());
        }
        
        // Delete from database
        photoRepository.delete(photo);
    }
    
    public long getTotalPhotosCount() {
        return photoRepository.count();
    }
    
    public long getPhotosCountByCategory(String category) {
        return photoRepository.countByCategory(category);
    }
}
