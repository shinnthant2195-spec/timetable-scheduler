package com.uni_project.timetable_scheduler.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig {

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**") // Protects and exposes all API endpoints
                        .allowedOrigins(
                                "http://localhost:5173", // Local Vite development port
                                "http://localhost:3000" // Alternative local port
                                // Future production frontend URL goes here
                        )
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                        .allowedHeaders("*")
                        .exposedHeaders("Location") // Crucial for reading URI redirection headers from StudentController
                        .allowCredentials(true);
            }
        };
    }
}
