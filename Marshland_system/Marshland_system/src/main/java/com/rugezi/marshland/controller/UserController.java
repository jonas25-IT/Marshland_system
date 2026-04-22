package com.rugezi.marshland.controller;

import com.rugezi.marshland.entity.User;
import com.rugezi.marshland.entity.UserRole;
import com.rugezi.marshland.service.UserService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {
    
    private final UserService userService;
    
    public UserController(UserService userService) {
        this.userService = userService;
    }
    
    @GetMapping("/profile")
    public User getCurrentUserProfile(Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        return userService.findById(currentUser.getUserId());
    }

    @PutMapping("/profile")
    public User updateProfile(@RequestBody User updatedData, Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        return userService.updateUser(currentUser.getUserId(), updatedData);
    }
    
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<User> getAllUsers(@RequestParam(required = false) UserRole role) {
        if (role != null) {
            return userService.findByRole(role);
        }
        return userService.findAll();
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public User getUserById(@PathVariable Long id) {
        return userService.findById(id);
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public User updateUser(@PathVariable Long id, @RequestBody User user) {
        return userService.updateUser(id, user);
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
    }
    
    @PostMapping("/{id}/deactivate")
    @PreAuthorize("hasRole('ADMIN')")
    public void deactivateUser(@PathVariable Long id) {
        userService.deactivateUser(id);
    }
    
    @PostMapping("/{id}/activate")
    @PreAuthorize("hasRole('ADMIN')")
    public void activateUser(@PathVariable Long id) {
        userService.activateUser(id);
    }
}
