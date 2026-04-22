package com.rugezi.marshland.service;

import com.rugezi.marshland.entity.Tour;
import com.rugezi.marshland.repository.TourRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class TourService {
    
    @Autowired
    private TourRepository tourRepository;
    
    public List<Tour> getAllActiveTours() {
        return tourRepository.findByIsActiveTrueOrderByCreatedAtDesc();
    }
    
    public Tour getTourById(Long tourId) {
        return tourRepository.findById(tourId)
                .orElseThrow(() -> new RuntimeException("Tour not found with id: " + tourId));
    }
    
    public List<Tour> getToursByCategory(String category) {
        return tourRepository.findByCategoryOrderByCreatedAtDesc(category);
    }
    
    public Tour createTour(Tour tour) {
        return tourRepository.save(tour);
    }
    
    public Tour updateTour(Long tourId, Tour tourDetails) {
        Tour tour = getTourById(tourId);
        tour.setTitle(tourDetails.getTitle());
        tour.setDescription(tourDetails.getDescription());
        tour.setCategory(tourDetails.getCategory());
        tour.setPrice(tourDetails.getPrice());
        tour.setDurationHours(tourDetails.getDurationHours());
        tour.setMaxParticipants(tourDetails.getMaxParticipants());
        tour.setImageUrl(tourDetails.getImageUrl());
        tour.setIsActive(tourDetails.getIsActive());
        return tourRepository.save(tour);
    }
    
    public void deleteTour(Long tourId) {
        Tour tour = getTourById(tourId);
        tour.setIsActive(false);
        tourRepository.save(tour);
    }
}
