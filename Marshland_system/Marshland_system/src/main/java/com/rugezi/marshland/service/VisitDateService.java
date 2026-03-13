package com.rugezi.marshland.service;

import com.rugezi.marshland.entity.VisitDate;
import com.rugezi.marshland.repository.VisitDateRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class VisitDateService {
    
    private final VisitDateRepository visitDateRepository;
    
    public VisitDateService(VisitDateRepository visitDateRepository) {
        this.visitDateRepository = visitDateRepository;
    }
    
    public VisitDate createVisitDate(VisitDate visitDate) {
        if (visitDateRepository.existsByVisitDate(visitDate.getVisitDate())) {
            throw new RuntimeException("Visit date already exists: " + visitDate.getVisitDate());
        }
        
        return visitDateRepository.save(visitDate);
    }
    
    public VisitDate updateVisitDate(Long id, VisitDate visitDateDetails) {
        VisitDate visitDate = getVisitDateById(id);
        
        visitDate.setMaxCapacity(visitDateDetails.getMaxCapacity());
        
        return visitDateRepository.save(visitDate);
    }
    
    public void deleteVisitDate(Long id) {
        if (!visitDateRepository.existsById(id)) {
            throw new RuntimeException("Visit date not found with id: " + id);
        }
        visitDateRepository.deleteById(id);
    }
    
    public Optional<VisitDate> findById(Long id) {
        return visitDateRepository.findById(id);
    }
    
    public VisitDate getVisitDateById(Long id) {
        return visitDateRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Visit date not found with id: " + id));
    }
    
    public List<VisitDate> findAll() {
        return visitDateRepository.findAll();
    }
    
    public List<VisitDate> findUpcomingDates() {
        return visitDateRepository.findByVisitDateAfterOrderByVisitDate(LocalDate.now());
    }
    
    public List<VisitDate> findAvailableDates(Integer requiredVisitors) {
        return visitDateRepository.findAvailableDates(LocalDate.now(), requiredVisitors);
    }
    
    public List<VisitDate> findByDateRange(LocalDate startDate, LocalDate endDate) {
        return visitDateRepository.findByVisitDateBetweenOrderByVisitDate(startDate, endDate);
    }
    
    public VisitDate findByVisitDate(LocalDate date) {
        return visitDateRepository.findByVisitDate(date);
    }
    
    public boolean existsByVisitDate(LocalDate date) {
        return visitDateRepository.existsByVisitDate(date);
    }
}
