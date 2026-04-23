package com.rugezi.marshland.controller;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.net.MalformedURLException;
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
            
            // Construct the file path
            Path filePath = Paths.get("uploads/species").resolve(decodedFilename).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                String contentType = determineContentType(filePath);
                return ResponseEntity.ok()
                        .contentType(contentType != null ? MediaType.parseMediaType(contentType) : MediaType.IMAGE_JPEG)
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (MalformedURLException e) {
            return ResponseEntity.badRequest().build();
        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/gallery/{filename:.+}")
    public ResponseEntity<Resource> serveGalleryImage(@PathVariable String filename) {
        try {
            // Decode the URL-encoded filename
            String decodedFilename = java.net.URLDecoder.decode(filename, "UTF-8");
            
            // Construct the file path
            Path filePath = Paths.get("uploads/gallery").resolve(decodedFilename).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                String contentType = determineContentType(filePath);
                return ResponseEntity.ok()
                        .contentType(contentType != null ? MediaType.parseMediaType(contentType) : MediaType.IMAGE_JPEG)
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (MalformedURLException e) {
            return ResponseEntity.badRequest().build();
        } catch (IOException e) {
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
