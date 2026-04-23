package com.rugezi.marshland;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class MarshlandSystemApplication {
    public static void main(String[] args) {
        SpringApplication.run(MarshlandSystemApplication.class, args);
    }
}
