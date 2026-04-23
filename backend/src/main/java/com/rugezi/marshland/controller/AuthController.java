package com.rugezi.marshland.controller;

import com.rugezi.marshland.dto.JwtResponse;
import com.rugezi.marshland.dto.LoginRequest;
import com.rugezi.marshland.entity.User;
import com.rugezi.marshland.entity.UserRole;
import com.rugezi.marshland.security.JwtUtils;
import com.rugezi.marshland.service.UserService;
import com.rugezi.marshland.service.SystemActivityService;
import com.rugezi.marshland.validator.PasswordValidator;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    
    private final UserService userService;
    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;
    private final SystemActivityService systemActivityService;
    
    public AuthController(UserService userService, AuthenticationManager authenticationManager, JwtUtils jwtUtils, SystemActivityService systemActivityService) {
        this.userService = userService;
        this.authenticationManager = authenticationManager;
        this.jwtUtils = jwtUtils;
        this.systemActivityService = systemActivityService;
    }
    
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        // Validate password strength
        PasswordValidator.ValidationResult validation = PasswordValidator.validatePassword(user.getPasswordHash());
        if (!validation.isValid()) {
            return ResponseEntity
                    .badRequest()
                    .body(validation.getMessage());
        }
        
        try {
            User registeredUser = userService.registerUser(user);
            return ResponseEntity.ok(registeredUser);
        } catch (RuntimeException e) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body("Registration failed: " + e.getMessage());
        }
    }
    
    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest, HttpServletRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = jwtUtils.generateJwtToken(authentication);
            
            User userDetails = (User) authentication.getPrincipal();    
            List<String> roles = userDetails.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .collect(Collectors.toList());

            // Track successful login
            systemActivityService.trackLogin(userDetails.getEmail(), roles.get(0), request, true);

            return ResponseEntity.ok(new JwtResponse(jwt, 
                                     userDetails.getUserId(), 
                                     userDetails.getEmail(), 
                                     roles));
        } catch (org.springframework.security.core.AuthenticationException e) {
            // Track failed login
            User user = userService.findByEmail(loginRequest.getEmail()).orElse(null);
            String userRole = user != null ? user.getRole().toString() : "UNKNOWN";
            systemActivityService.trackLogin(loginRequest.getEmail(), userRole, request, false);
            
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
        }
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
    
    @GetMapping("/password-requirements")
    public String getPasswordRequirements() {
        return PasswordValidator.getPasswordRequirements();
    }
}
