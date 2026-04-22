package com.rugezi.marshland.controller;

import com.rugezi.marshland.entity.GalleryPhoto;
import com.rugezi.marshland.entity.User;
import com.rugezi.marshland.service.GalleryPhotoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/gallery")
@CrossOrigin(origins = "*", maxAge = 3600)
public class GalleryController {
    
    @Autowired
    private GalleryPhotoService galleryPhotoService;
    
    private final String UPLOAD_DIR = "uploads/gallery";
    
    // CREATE - Upload new photo
    @PostMapping("/photos")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> createPhoto(@RequestBody GalleryPhoto photo, Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();
            GalleryPhoto createdPhoto = galleryPhotoService.createPhoto(photo, user);
            return ResponseEntity.ok(createdPhoto);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    // FILE UPLOAD - Upload image file and return URL
    @PostMapping("/upload")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> uploadImage(@RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Please select a file to upload"));
            }
            
            // Create upload directory if it doesn't exist
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            
            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String uniqueFilename = UUID.randomUUID().toString() + extension;
            
            // Save file
            Path filePath = uploadPath.resolve(uniqueFilename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
            
            // Return accessible URL
            String fileUrl = "/api/gallery/files/" + uniqueFilename;
            
            return ResponseEntity.ok(Map.of(
                "imageUrl", fileUrl,
                "fileName", originalFilename,
                "contentType", file.getContentType(),
                "fileSize", file.getSize()
            ));
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to upload file: " + e.getMessage()));
        }
    }
    
    // SERVE FILE - Serve uploaded files
    @GetMapping("/files/{filename:.+}")
    public ResponseEntity<?> serveFile(@PathVariable String filename) {
        try {
            Path filePath = Paths.get(UPLOAD_DIR).resolve(filename).normalize();
            File file = filePath.toFile();
            
            if (!file.exists()) {
                return ResponseEntity.notFound().build();
            }
            
            byte[] fileContent = Files.readAllBytes(filePath);
            return ResponseEntity.ok()
                .header("Content-Type", Files.probeContentType(filePath))
                .header("Content-Disposition", "inline; filename=\"" + filename + "\"")
                .body(fileContent);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to serve file: " + e.getMessage()));
        }
    }
    
    // READ - Get all active photos
    @GetMapping("/photos")
    public ResponseEntity<?> getAllPhotos() {
        try {
            System.out.println(">>> Fetching all photos from gallery");
            List<GalleryPhoto> photos = galleryPhotoService.getAllPhotos();
            System.out.println(">>> Found " + photos.size() + " photos");
            return ResponseEntity.ok(photos);
        } catch (Exception e) {
            System.err.println(">>> Error fetching photos: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    // READ - Get photo by ID
    @GetMapping("/photos/{photoId}")
    public ResponseEntity<?> getPhotoById(@PathVariable Long photoId) {
        try {
            GalleryPhoto photo = galleryPhotoService.getPhotoById(photoId);
            return ResponseEntity.ok(photo);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    // READ - Get photos by category
    @GetMapping("/photos/category/{category}")
    public ResponseEntity<List<GalleryPhoto>> getPhotosByCategory(@PathVariable String category) {
        List<GalleryPhoto> photos = galleryPhotoService.getPhotosByCategory(category);
        return ResponseEntity.ok(photos);
    }
    
    // READ - Search photos
    @GetMapping("/photos/search")
    public ResponseEntity<List<GalleryPhoto>> searchPhotos(@RequestParam(required = false) String searchTerm) {
        List<GalleryPhoto> photos = galleryPhotoService.searchPhotos(searchTerm);
        return ResponseEntity.ok(photos);
    }
    
    // READ - Get recent photos
    @GetMapping("/photos/recent")
    public ResponseEntity<List<GalleryPhoto>> getRecentPhotos() {
        List<GalleryPhoto> photos = galleryPhotoService.getRecentPhotos();
        return ResponseEntity.ok(photos);
    }
    
    // READ - Get photos uploaded by current user
    @GetMapping("/photos/my-uploads")
    @PreAuthorize("hasAnyRole('ADMIN', 'ECOLOGIST', 'STAFF')")
    public ResponseEntity<List<GalleryPhoto>> getMyUploads(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        List<GalleryPhoto> photos = galleryPhotoService.getPhotosByUser(user.getUserId());
        return ResponseEntity.ok(photos);
    }
    
    // UPDATE - Update photo
    @PutMapping("/photos/{photoId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ECOLOGIST', 'STAFF')")
    public ResponseEntity<?> updatePhoto(@PathVariable Long photoId, @RequestBody GalleryPhoto photoDetails) {
        try {
            GalleryPhoto updatedPhoto = galleryPhotoService.updatePhoto(photoId, photoDetails);
            return ResponseEntity.ok(updatedPhoto);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    // DELETE - Delete photo
    @DeleteMapping("/photos/{photoId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ECOLOGIST')")
    public ResponseEntity<?> deletePhoto(@PathVariable Long photoId) {
        try {
            galleryPhotoService.deletePhoto(photoId);
            return ResponseEntity.ok(Map.of("message", "Photo deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    // GET - Gallery statistics
    @GetMapping("/photos/statistics")
    @PreAuthorize("hasAnyRole('ADMIN', 'ECOLOGIST')")
    public ResponseEntity<?> getGalleryStatistics() {
        Map<String, Object> statistics = galleryPhotoService.getPhotoStatistics();
        return ResponseEntity.ok(statistics);
    }
    
    // GET - All categories
    @GetMapping("/photos/categories")
    public ResponseEntity<List<String>> getAllCategories() {
        List<String> categories = galleryPhotoService.getAllCategories();
        return ResponseEntity.ok(categories);
    }
}
