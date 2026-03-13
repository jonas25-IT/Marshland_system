package com.rugezi.marshland.controller;

import com.rugezi.marshland.dto.JwtResponse;
import com.rugezi.marshland.dto.LoginRequest;
import com.rugezi.marshland.entity.User;
import com.rugezi.marshland.entity.UserRole;
import com.rugezi.marshland.security.JwtUtils;
import com.rugezi.marshland.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    
    private final UserService userService;
    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;
    
    public AuthController(UserService userService, AuthenticationManager authenticationManager, JwtUtils jwtUtils) {
        this.userService = userService;
        this.authenticationManager = authenticationManager;
        this.jwtUtils = jwtUtils;
    }
    
    @PostMapping("/register")
    public User registerUser(@RequestBody User user) {
        return userService.registerUser(user);
    }
    
    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);
        
        User userDetails = (User) authentication.getPrincipal();    
        List<String> roles = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());

        return ResponseEntity.ok(new JwtResponse(jwt, 
                                 userDetails.getUserId(), 
                                 userDetails.getEmail(), 
                                 roles));
    }
    
    @GetMapping("/profile")
    public User getProfile() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || authentication.getPrincipal().equals("anonymousUser")) {
             throw new RuntimeException("User not authenticated");
        }
        return (User) authentication.getPrincipal();
    }
    
    @PutMapping("/profile")
    public User updateProfile(@RequestBody User user) {
        User currentUser = getProfile();
        return userService.updateUser(currentUser.getUserId(), user);
    }
    
    @GetMapping("/roles")
    public UserRole[] getRoles() {
        return UserRole.values();
    }
}
