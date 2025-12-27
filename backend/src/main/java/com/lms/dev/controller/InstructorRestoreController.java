package com.lms.dev.controller;

import com.lms.dev.dto.ApiResponse;
import com.lms.dev.dto.InstructorAdminDTO;
import com.lms.dev.service.InstructorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/instructors")
@RequiredArgsConstructor
public class InstructorRestoreController {

    private final InstructorService instructorService;

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}/restore")
    public ResponseEntity<ApiResponse<InstructorAdminDTO>> restore(@PathVariable UUID id) {
        return instructorService.restoreInstructor(id)
                .map(dto -> ResponseEntity.ok(new ApiResponse<>("Đã khôi phục giảng viên", dto)))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ApiResponse<>("Không tìm thấy giảng viên", null)));
    }
}

