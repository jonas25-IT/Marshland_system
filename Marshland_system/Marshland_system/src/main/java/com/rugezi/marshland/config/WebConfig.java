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
        // Serve species images
        Path speciesPath = Paths.get("uploads/species");
        String speciesAbsolutePath = speciesPath.toFile().getAbsolutePath();
        registry.addResourceHandler("/uploads/species/**")
                .addResourceLocations("file:" + speciesAbsolutePath + "/");

        // Serve gallery images
        Path galleryPath = Paths.get("uploads/gallery");
        String galleryAbsolutePath = galleryPath.toFile().getAbsolutePath();
        registry.addResourceHandler("/uploads/gallery/**")
                .addResourceLocations("file:" + galleryAbsolutePath + "/");

        // Also serve from general uploads for compatibility
        Path uploadPath = Paths.get("uploads");
        String uploadAbsolutePath = uploadPath.toFile().getAbsolutePath();
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:" + uploadAbsolutePath + "/");
    }
}
