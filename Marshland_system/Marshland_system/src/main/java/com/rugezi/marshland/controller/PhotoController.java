package com.rugezi.marshland.controller;

import com.rugezi.marshland.entity.Photo;
import com.rugezi.marshland.entity.User;
import com.rugezi.marshland.service.PhotoService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/photos")
@CrossOrigin(origins = "*", maxAge = 3600)
public class PhotoController {
    
    private final PhotoService photoService;
    
    public PhotoController(PhotoService photoService) {
        this.photoService = photoService;
    }
    
    @GetMapping
    public ResponseEntity<List<Photo>> getAllPhotos() {
        List<Photo> photos = photoService.getAllPhotos();
        return ResponseEntity.ok(photos);
    }
    
    @GetMapping("/category/{category}")
    public ResponseEntity<List<Photo>> getPhotosByCategory(@PathVariable String category) {
        List<Photo> photos = photoService.getPhotosByCategory(category);
        return ResponseEntity.ok(photos);
    }
    
    @GetMapping("/my")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Photo>> getMyPhotos(Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        List<Photo> photos = photoService.getPhotosByUser(currentUser);
        return ResponseEntity.ok(photos);
    }
    
    @GetMapping("/{photoId}")
    public ResponseEntity<Photo> getPhotoById(@PathVariable Long photoId) {
        Photo photo = photoService.getPhotoById(photoId);
        return ResponseEntity.ok(photo);
    }
    
    @PostMapping("/upload")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> uploadPhoto(
            @RequestParam("file") MultipartFile file,
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("category") String category,
            Authentication authentication) {
        
        try {
            User currentUser = (User) authentication.getPrincipal();
            Photo photo = photoService.uploadPhoto(file, title, description, category, currentUser);
            return ResponseEntity.ok(photo);
        } catch (IOException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to upload photo: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @DeleteMapping("/{photoId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> deletePhoto(@PathVariable Long photoId, Authentication authentication) {
        try {
            User currentUser = (User) authentication.getPrincipal();
            photoService.deletePhoto(photoId, currentUser);
            return ResponseEntity.ok(Map.of("message", "Photo deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getPhotoStats() {
        Map<String, Object> stats = Map.of(
            "totalPhotos", photoService.getTotalPhotosCount(),
            "landscapeCount", photoService.getPhotosCountByCategory("landscape"),
            "floraCount", photoService.getPhotosCountByCategory("flora"),
            "faunaCount", photoService.getPhotosCountByCategory("fauna"),
            "birdsCount", photoService.getPhotosCountByCategory("birds"),
            "wetlandCount", photoService.getPhotosCountByCategory("wetland"),
            "sunsetCount", photoService.getPhotosCountByCategory("sunset"),
            "otherCount", photoService.getPhotosCountByCategory("other")
        );
        return ResponseEntity.ok(stats);
    }
}
