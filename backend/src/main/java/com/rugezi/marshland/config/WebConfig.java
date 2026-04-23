package com.rugezi.marshland.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Serve species images from uploads/species directory
        Path speciesPath = Paths.get("uploads/species");
        String speciesAbsolutePath = speciesPath.toFile().getAbsolutePath();
        registry.addResourceHandler("/uploads/species/**")
                .addResourceLocations("file:" + speciesAbsolutePath + "/");

        // Also serve species files from general uploads path for compatibility with old database URLs
        // This maps /uploads/filename to uploads/species/filename
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:" + speciesAbsolutePath + "/");

        // Serve gallery images from uploads/gallery directory
        Path galleryPath = Paths.get("uploads/gallery");
        String galleryAbsolutePath = galleryPath.toFile().getAbsolutePath();
        registry.addResourceHandler("/uploads/gallery/**")
                .addResourceLocations("file:" + galleryAbsolutePath + "/");

        // Serve gallery images via API endpoint for local uploads
        registry.addResourceHandler("/api/gallery/files/**")
                .addResourceLocations("file:" + galleryAbsolutePath + "/");
    }
}
