
package com.rugezi.marshland.service;

import com.rugezi.marshland.entity.User;
import com.rugezi.marshland.entity.UserRole;
import com.rugezi.marshland.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@Transactional
public class UserService implements UserDetailsService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        return userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new UsernameNotFoundException("User not found with email: " + email));
    }

    public User registerUser(User user) {

        System.out.println("=== USER SERVICE REGISTRATION ===");
        System.out.println("Email: " + user.getEmail());

        // Check if email already exists
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email already exists: " + user.getEmail());
        }

        // Get the password hash (either raw password or pre-set password hash)
        String plainPassword = user.getRawPassword();
        if (plainPassword == null || plainPassword.isBlank()) {
            // If no raw password, use the current password hash (assumed to be plain text)
            plainPassword = user.getPasswordHash();
        }

        if (plainPassword == null || plainPassword.isBlank()) {
            throw new RuntimeException("Password cannot be null or empty");
        }

        // Hash password
        String hashedPassword = passwordEncoder.encode(plainPassword);
        user.setPasswordHash(hashedPassword);

        // Clear raw password for security
        user.setRawPassword(null);

        // Set default values
        user.setIsActive(true);
        user.setRegistrationDate(LocalDateTime.now());
        user.setLastUpdated(LocalDateTime.now());

        System.out.println("Saving user...");

        User savedUser = userRepository.save(user);

        System.out.println("User saved! ID: " + savedUser.getUserId());

        return savedUser;
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public User findById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("User not found with id: " + id));
    }

    public List<User> findAll() {
        return userRepository.findAll();
    }

    public List<User> findByRole(UserRole role) {
        return userRepository.findByRole(role);
    }
    
    public User createUser(User user) {
        // Check if email already exists
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email already exists: " + user.getEmail());
        }
        
        // Set default values
        user.setIsActive(true);
        user.setRegistrationDate(LocalDateTime.now());
        user.setLastUpdated(LocalDateTime.now());
        
        return userRepository.save(user);
    }

    public Page<User> findAll(Pageable pageable) {
        return userRepository.findAll(pageable);
    }

    public long countUsers() {
        return userRepository.count();
    }

    public List<User> findActiveUsersByRole(UserRole role) {
        return userRepository.findActiveUsersByRole(role);
    }

    public long countActiveUsersByRole(UserRole role) {
        return userRepository.countActiveUsersByRole(role);
    }

    public User updateUser(Long id, User userDetails) {

        User user = findById(id);

        user.setFirstName(userDetails.getFirstName());
        user.setLastName(userDetails.getLastName());
        user.setPhone(userDetails.getPhone());
        user.setRole(userDetails.getRole());

        if (userDetails.getPassword() != null && !userDetails.getPassword().isBlank()) {
            user.setPasswordHash(passwordEncoder.encode(userDetails.getPassword()));
        }

        user.setLastUpdated(LocalDateTime.now());

        return userRepository.save(user);
    }

    public void deactivateUser(Long id) {
        User user = findById(id);
        user.setIsActive(false);
        userRepository.save(user);
    }

    public void activateUser(Long id) {
        User user = findById(id);
        user.setIsActive(true);
        userRepository.save(user);
    }

    public void deleteUser(Long id) {

        if (!userRepository.existsById(id)) {
            throw new RuntimeException("User not found with id: " + id);
        }

        userRepository.deleteById(id);
    }

    // RBAC specific methods
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public long getTotalUsersCount() {
        return userRepository.count();
    }

    public List<User> getRecentUsers(int limit) {
        return userRepository.findAll().stream()
                .sorted((u1, u2) -> u2.getRegistrationDate().compareTo(u1.getRegistrationDate()))
                .limit(limit)
                .toList();
    }

    public User approveUser(Long userId) {
        User user = findById(userId);
        user.setIsActive(true);
        return userRepository.save(user);
    }

    public User rejectUser(Long userId) {
        User user = findById(userId);
        user.setIsActive(false);
        return userRepository.save(user);
    }

    public Map<String, Object> getUserStatistics() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("total", getTotalUsersCount());
        stats.put("active", userRepository.findAll().stream().mapToLong(u -> u.getIsActive() ? 1 : 0).sum());
        stats.put("byRole", Map.of(
            "ADMIN", countActiveUsersByRole(UserRole.ADMIN),
            "ECOLOGIST", countActiveUsersByRole(UserRole.ECOLOGIST),
            "TOURIST", countActiveUsersByRole(UserRole.TOURIST),
            "STAFF", countActiveUsersByRole(UserRole.STAFF)
        ));
        return stats;
    }

    public User getCurrentUser() {
        return findAll().stream().findFirst()
                .orElseThrow(() -> new RuntimeException("No users found"));
    }
}

