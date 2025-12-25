package com.lms.dev.controller;

import com.lms.dev.dto.AdminStudentDTO;
import com.lms.dev.dto.ApiResponse;
import com.lms.dev.dto.AssignStudentRequest;
import com.lms.dev.dto.MoveStudentRequest;
import com.lms.dev.entity.Learning;
import com.lms.dev.service.AdminClassStudentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminClassStudentController {

    private final AdminClassStudentService adminClassStudentService;

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/classes/{classSectionId}/students")
    public ResponseEntity<ApiResponse<List<AdminStudentDTO>>> listStudentsInClass(@PathVariable UUID classSectionId) {
        try {
            return ResponseEntity.ok(new ApiResponse<>("OK", adminClassStudentService.listStudentsInClass(classSectionId)));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ApiResponse<>(e.getMessage(), null));
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/classes/{classSectionId}/students")
    public ResponseEntity<ApiResponse<Void>> assignStudent(@PathVariable UUID classSectionId,
                                                           @Valid @RequestBody AssignStudentRequest req) {
        try {
            Learning saved = adminClassStudentService.assignStudentToClass(classSectionId, req.getUserId());
            return ResponseEntity.ok(new ApiResponse<>("Assigned", null));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ApiResponse<>(e.getMessage(), null));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ApiResponse<>(e.getMessage(), null));
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/classes/{fromClassId}/students/{userId}/move")
    public ResponseEntity<ApiResponse<Void>> moveStudent(@PathVariable UUID fromClassId,
                                                         @PathVariable UUID userId,
                                                         @Valid @RequestBody MoveStudentRequest req) {
        try {
            adminClassStudentService.moveStudent(fromClassId, userId, req.getToClassSectionId());
            return ResponseEntity.ok(new ApiResponse<>("Moved", null));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ApiResponse<>(e.getMessage(), null));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ApiResponse<>(e.getMessage(), null));
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/students/unassigned")
    public ResponseEntity<ApiResponse<List<AdminStudentDTO>>> listUnassigned(@RequestParam(required = false) UUID courseId) {
        try {
            return ResponseEntity.ok(new ApiResponse<>("OK", adminClassStudentService.listUnassignedPaidStudents(courseId)));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ApiResponse<>(e.getMessage(), null));
        }
    }
}

