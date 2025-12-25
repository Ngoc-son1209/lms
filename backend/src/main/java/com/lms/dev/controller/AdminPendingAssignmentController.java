package com.lms.dev.controller;

import com.lms.dev.dto.ApiResponse;
import com.lms.dev.dto.AdminStudentDTO;
import com.lms.dev.service.AdminClassStudentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/pending-class-assignments")
@RequiredArgsConstructor
public class AdminPendingAssignmentController {

    private final AdminClassStudentService adminClassStudentService;

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<ApiResponse<List<AdminStudentDTO>>> list(@RequestParam(required = false) UUID courseId) {
        try {
            return ResponseEntity
                    .ok(new ApiResponse<>("OK", adminClassStudentService.listUnassignedPaidStudents(courseId)));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(404).body(new ApiResponse<>(e.getMessage(), null));
        }
    }
}
