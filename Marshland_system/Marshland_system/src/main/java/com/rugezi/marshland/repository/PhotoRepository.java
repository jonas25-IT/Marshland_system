package com.rugezi.marshland.repository;

import com.rugezi.marshland.entity.Photo;
import com.rugezi.marshland.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PhotoRepository extends JpaRepository<Photo, Long> {
    
    List<Photo> findByUploadedByOrderByUploadDateDesc(User user);
    
    List<Photo> findByCategoryOrderByUploadDateDesc(String category);
    
    List<Photo> findAllByOrderByUploadDateDesc();
    
    long countByCategory(String category);
}
