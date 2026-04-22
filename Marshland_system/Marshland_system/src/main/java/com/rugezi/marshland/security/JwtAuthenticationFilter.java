package com.rugezi.marshland.security;

import com.rugezi.marshland.service.UserService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;
import java.util.Collection;
import java.util.Collections;
import java.util.List;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    @Lazy
    private UserService userService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        try {
            String jwt = parseJwt(request);
            System.out.println("JWT Token present: " + (jwt != null));
            if (jwt != null) {
                System.out.println("JWT Token (first 50 chars): " + jwt.substring(0, Math.min(50, jwt.length())));
                boolean isValid = jwtUtils.validateJwtToken(jwt);
                System.out.println("JWT Token valid: " + isValid);
                
                if (isValid) {
                    String username = jwtUtils.getUserNameFromJwtToken(jwt);
                    System.out.println("Username from token: " + username);

                    UserDetails userDetails = userService.loadUserByUsername(username);
                    
                    // Extract and clean role authority
                    String role = userDetails.getAuthorities().stream()
                            .findFirst()
                            .map(GrantedAuthority::getAuthority)
                            .orElse("TOURIST");

                    // UNIVERSAL ADMIN AUTHORITY OVERRIDE
                    Collection<SimpleGrantedAuthority> authorities;
                    if ("admin@rugezi.rw".equalsIgnoreCase(username)) {
                        authorities = List.of(
                            new SimpleGrantedAuthority("ADMIN"),
                            new SimpleGrantedAuthority("ROLE_ADMIN")
                        );
                    } else {
                        if (!role.startsWith("ROLE_")) {
                            role = "ROLE_" + role;
                        }
                        authorities = List.of(new SimpleGrantedAuthority(role));
                    }

                    System.out.println(">>> UNIVERSAL HANDSHAKE: User=" + username + " Authorities=" + authorities);
                    
                    UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                            userDetails, null, authorities);
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    System.out.println(">>> CONTEXT SET: Auth=" + SecurityContextHolder.getContext().getAuthentication());
                    System.out.println("Authentication set successfully for user: " + username);
                }
            }
        } catch (Exception e) {
            System.err.println("Cannot set user authentication: " + e.getMessage());
            e.printStackTrace();
        }

        filterChain.doFilter(request, response);
    }

    private String parseJwt(HttpServletRequest request) {
        String headerAuth = request.getHeader("Authorization");

        if (StringUtils.hasText(headerAuth) && headerAuth.startsWith("Bearer ")) {
            return headerAuth.substring(7);
        }

        return null;
    }
}
