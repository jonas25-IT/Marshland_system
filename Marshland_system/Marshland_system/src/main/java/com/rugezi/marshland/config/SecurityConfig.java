package com.rugezi.marshland.config;

import com.rugezi.marshland.security.JwtAuthenticationFilter;
import com.rugezi.marshland.service.UserService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final UserService userService;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(@Lazy UserService userService, JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.userService = userService;
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(List.of("*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setExposedHeaders(Arrays.asList("Authorization", "Content-Type"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> 
                    auth.requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/species/**").permitAll() // Public access for species info
                        .requestMatchers("/api/photos/**").permitAll() // Public access for old photos endpoint
                        .requestMatchers("/api/gallery/photos").permitAll() // Public access to view all photos
                        .requestMatchers("/api/gallery/photos/{photoId}").permitAll() // Public access to view photo by ID
                        .requestMatchers("/api/gallery/photos/category/{category}").permitAll() // Public access to view photos by category
                        .requestMatchers("/api/gallery/photos/search").permitAll() // Public access to search photos
                        .requestMatchers("/api/gallery/photos/recent").permitAll() // Public access to recent photos
                        .requestMatchers("/api/gallery/photos/categories").permitAll() // Public access to categories
                        .requestMatchers("/api/gallery/files/{filename:.+}").permitAll() // Public access to serve files
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        .requestMatchers("/api/ecologist/**").hasAnyRole("ADMIN", "ECOLOGIST")
                        .requestMatchers("/api/tourist/**").hasAnyRole("ADMIN", "TOURIST")
                        .requestMatchers("/api/staff/**").hasAnyRole("ADMIN", "STAFF")
                        .requestMatchers("/api/users/profile").authenticated()
                        .requestMatchers("/api/users/**").hasRole("ADMIN")
                        // Booking endpoints by role
                        .requestMatchers("/api/bookings/create").hasAnyRole("TOURIST", "ADMIN")
                        .requestMatchers("/api/bookings/my-bookings").hasAnyRole("TOURIST", "ADMIN")
                        .requestMatchers("/api/bookings/approve").hasRole("ADMIN")
                        .requestMatchers("/api/bookings/daily").hasAnyRole("ADMIN", "STAFF", "ECOLOGIST")
                        .requestMatchers("/api/bookings/**").authenticated()
                        .requestMatchers("/api/feedback/create").hasAnyRole("TOURIST", "ADMIN")
                        .requestMatchers("/api/feedback/**").authenticated()
                        .requestMatchers("/api/visit-dates/**").authenticated()
                        .requestMatchers("/api/analytics/**").hasAnyRole("ADMIN", "ECOLOGIST")
                        .anyRequest().authenticated()
                )
                .headers(headers -> headers
                    .frameOptions(frameOptions -> frameOptions.deny())
                    .contentTypeOptions(contentTypeOptions -> {})
                    .httpStrictTransportSecurity(hstsConfig -> hstsConfig
                        .maxAgeInSeconds(31536000)
                    )
                    .cacheControl(cache -> cache.disable())
                );

        http.authenticationProvider(authenticationProvider());
        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
