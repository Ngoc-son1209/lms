package com.lms.dev.controller;

import com.lms.dev.dto.AdminStatsDTO;
import com.lms.dev.dto.ApiResponse;
import com.lms.dev.repository.CourseRepository;
import com.lms.dev.repository.LearningRepository;
import com.lms.dev.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/stats")
@RequiredArgsConstructor
public class AdminStatsController {

    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final LearningRepository learningRepository;

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<ApiResponse<AdminStatsDTO>> getStats() {
        AdminStatsDTO dto = AdminStatsDTO.builder()
                .totalUsers(userRepository.count())
                .totalCourses(courseRepository.count())
                .totalEnrollments(learningRepository.count())
                .build();

        return ResponseEntity.ok(new ApiResponse<>("OK", dto));
    }
}

