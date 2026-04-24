package com.rugezi.marshland.controller;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/api/files")
public class FileController {

    @GetMapping("/species/{filename:.+}")
    public ResponseEntity<Resource> serveSpeciesImage(@PathVariable String filename) {
        try {
            // Decode the URL-encoded filename
            String decodedFilename = java.net.URLDecoder.decode(filename, "UTF-8");
            
            // Get absolute path to uploads directory
            Path uploadDir = Paths.get("uploads/species").toAbsolutePath().normalize();
            Path filePath = uploadDir.resolve(decodedFilename).normalize();
            
            System.out.println("Looking for species image: " + filePath);
            System.out.println("File exists: " + Files.exists(filePath));
            
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                String contentType = determineContentType(filePath);
                return ResponseEntity.ok()
                        .contentType(contentType != null ? MediaType.parseMediaType(contentType) : MediaType.IMAGE_JPEG)
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                        .body(resource);
            } else {
                System.out.println("File not found or not readable: " + filePath);
                // Return fallback image using Unsplash
                String fallbackUrl = "https://source.unsplash.com/400x400/?nature,wildlife,species," + decodedFilename.replaceAll("[^a-zA-Z0-9]", "");
                System.out.println("Redirecting to fallback image: " + fallbackUrl);
                return ResponseEntity.status(302).header("Location", fallbackUrl).build();
            }
        } catch (MalformedURLException e) {
            System.err.println("Malformed URL for file: " + e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (IOException e) {
            System.err.println("IO error serving file: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/gallery/{filename:.+}")
    public ResponseEntity<Resource> serveGalleryImage(@PathVariable String filename) {
        try {
            // Decode the URL-encoded filename
            String decodedFilename = java.net.URLDecoder.decode(filename, "UTF-8");
            
            // Get absolute path to uploads directory
            Path uploadDir = Paths.get("uploads/gallery").toAbsolutePath().normalize();
            Path filePath = uploadDir.resolve(decodedFilename).normalize();
            
            System.out.println("Looking for gallery image: " + filePath);
            System.out.println("File exists: " + Files.exists(filePath));
            
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                String contentType = determineContentType(filePath);
                return ResponseEntity.ok()
                        .contentType(contentType != null ? MediaType.parseMediaType(contentType) : MediaType.IMAGE_JPEG)
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                        .body(resource);
            } else {
                System.out.println("File not found or not readable: " + filePath);
                return ResponseEntity.notFound().build();
            }
        } catch (MalformedURLException e) {
            System.err.println("Malformed URL for file: " + e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (IOException e) {
            System.err.println("IO error serving file: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    private String determineContentType(Path filePath) throws IOException {
        String filename = filePath.getFileName().toString().toLowerCase();
        if (filename.endsWith(".jpg") || filename.endsWith(".jpeg")) {
            return "image/jpeg";
        } else if (filename.endsWith(".png")) {
            return "image/png";
        } else if (filename.endsWith(".gif")) {
            return "image/gif";
        } else if (filename.endsWith(".webp")) {
            return "image/webp";
        }
        return null;
    }
}
