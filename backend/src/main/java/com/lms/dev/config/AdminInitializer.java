package com.lms.dev.config;

import com.lms.dev.entity.User;
import com.lms.dev.entity.Instructor;
import com.lms.dev.enums.UserRole;
import com.lms.dev.repository.UserRepository;
import com.lms.dev.repository.InstructorRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@Slf4j
public class AdminInitializer {

    @Value("${app.default-admin.username:admin}")
    private String defaultUsername;

    @Value("${app.default-admin.password:admin123}")
    private String defaultPassword;

    @Value("${app.default-admin.email:admin@gmail.com}")
    private String defaultEmail;

    @Bean
    public CommandLineRunner createDefaultAdmin(UserRepository userRepository,
            PasswordEncoder passwordEncoder) {
        return args -> {
            if (!userRepository.existsByRole(UserRole.ADMIN)) {
                User admin = new User();
                admin.setUsername(defaultUsername);
                admin.setPassword(passwordEncoder.encode(defaultPassword));
                admin.setEmail(defaultEmail);
                admin.setRole(UserRole.ADMIN);
                admin.setEnabled(true);

                userRepository.save(admin);
                log.info("Default admin user created.");
            } else {
                log.info("Admin user already exists, skipping creation.");
            }
        };
    }

    // Backfill: link existing instructors to users by email on startup (idempotent)
    @Bean
    public CommandLineRunner linkInstructorsWithUsers(InstructorRepository instructorRepository,
            UserRepository userRepository) {
        return args -> {
            int updated = 0;
            for (Instructor ins : instructorRepository.findAll()) {
                try {
                    if (ins.getUser() == null && ins.getEmail() != null) {
                        User u = userRepository.findByEmail(ins.getEmail());
                        if (u != null) {
                            ins.setUser(u);
                            instructorRepository.save(ins);
                            updated++;
                        }
                    }
                } catch (Exception e) {
                    log.warn("Failed to link instructor {} by email {}: {}", ins.getId(), ins.getEmail(), e.getMessage());
                }
            }
            if (updated > 0) {
                log.info("Linked {} instructors with users by email.", updated);
            } else {
                log.info("No instructor-user links needed.");
            }
        }; 
    }
}
