package com._Blog.backend.config;

import com._Blog.backend.domain.model.User;
import com._Blog.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class AdminBootstrapConfig {

    @Bean
    CommandLineRunner ensureAdminUser(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            @Value("${app.admin.username}") String adminUsername,
            @Value("${app.admin.email}") String adminEmail,
            @Value("${app.admin.password}") String adminPassword
    ) {
        return args -> {
            if (userRepository.existsByUsername(adminUsername)) {
                return;
            }

            User admin = new User();
            admin.setUsername(adminUsername);
            admin.setFirstName("System");
            admin.setLastName("Admin");
            admin.setEmail(adminEmail);
            admin.setPassword(passwordEncoder.encode(adminPassword));
            admin.setRole("ADMIN");
            admin.setStatus("ACTIVE");

            userRepository.save(admin);
        };
    }
}
