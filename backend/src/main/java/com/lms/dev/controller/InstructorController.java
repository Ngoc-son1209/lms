package com.lms.dev.controller;

import com.lms.dev.dto.ApiResponse;
import com.lms.dev.dto.InstructorAdminDTO;
import com.lms.dev.dto.InstructorProfileDTO;
import com.lms.dev.dto.InstructorRegisterDTO;
import com.lms.dev.entity.Instructor;
import com.lms.dev.security.UserPrincipal;
import com.lms.dev.service.InstructorService;
import jakarta.mail.MessagingException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.io.UnsupportedEncodingException;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/instructors")
@RequiredArgsConstructor
@Slf4j
public class InstructorController {

    private final InstructorService instructorService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<Void>> register(@Valid @RequestBody InstructorRegisterDTO dto,
            HttpServletRequest request) {
        try {
            String siteURL = getSiteURL(request);
            instructorService.registerInstructor(dto, siteURL);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new ApiResponse<>(
                            "Đăng ký giảng viên thành công. Vui lòng kiểm tra email để xác thực. Sau đó chờ Admin duyệt để có thể đăng nhập.",
                            null));
        } catch (MessagingException | UnsupportedEncodingException e) {
            log.error("Register instructor - email error: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>("Không thể gửi email xác thực. Vui lòng thử lại", null));
        } catch (Exception e) {
            log.error("Register instructor error: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>("Có lỗi xảy ra. Vui lòng thử lại", null));
        }
    }

    // ============== Instructor self profile ==============
    @PreAuthorize("hasRole('INSTRUCTOR')")
    @GetMapping("/me")
    public ResponseEntity<InstructorProfileDTO> getMyProfile(@AuthenticationPrincipal UserPrincipal principal) {
        String email = principal.getEmail();
        InstructorProfileDTO dto = instructorService.getProfileByEmail(email);
        if (dto == null)
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        return ResponseEntity.ok(dto);
    }

    @PreAuthorize("hasRole('INSTRUCTOR')")
    @PutMapping("/me")
    public ResponseEntity<InstructorProfileDTO> updateMyProfile(@AuthenticationPrincipal UserPrincipal principal,
            @RequestBody InstructorProfileDTO payload) {
        String email = principal.getEmail();
        InstructorProfileDTO updated = instructorService.updateProfileByEmail(email, payload);
        return ResponseEntity.ok(updated);
    }

    // ============== Admin management ==============
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/pending")
    public ResponseEntity<List<InstructorAdminDTO>> getPending() {
        return ResponseEntity.ok(instructorService.getPendingInstructors());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/approved")
    public ResponseEntity<List<InstructorAdminDTO>> getApproved() {
        return ResponseEntity.ok(instructorService.getApprovedInstructors());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/resigned")
    public ResponseEntity<List<InstructorAdminDTO>> getResigned() {
        return ResponseEntity.ok(instructorService.getResignedInstructors());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<InstructorAdminDTO>> approve(@PathVariable UUID id) {
        return instructorService.approveInstructor(id)
                .flatMap(ins -> instructorService.updateInstructor(ins.getId(), new InstructorAdminDTO()))
                .map(dto -> ResponseEntity.ok(new ApiResponse<>("Duyệt giảng viên thành công", dto)))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ApiResponse<>("Không tìm thấy giảng viên", null)));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<InstructorAdminDTO>> update(@PathVariable UUID id,
            @RequestBody InstructorAdminDTO dto) {
        return instructorService.updateInstructor(id, dto)
                .map(updated -> ResponseEntity.ok(new ApiResponse<>("Cập nhật giảng viên thành công", updated)))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ApiResponse<>("Không tìm thấy giảng viên", null)));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<InstructorAdminDTO>> reject(@PathVariable UUID id,
            @RequestBody com.lms.dev.dto.RejectRequest req) {
        return instructorService.rejectInstructor(id, req.getReason())
                .map(dto -> ResponseEntity.ok(new ApiResponse<>("Đã từ chối giảng viên", dto)))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ApiResponse<>("Không tìm thấy giảng viên", null)));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id:[0-9a-fA-F\\-]{36}}")
    public ResponseEntity<ApiResponse<InstructorAdminDTO>> resign(@PathVariable UUID id) {
        return instructorService.resignInstructor(id)
                .map(dto -> ResponseEntity.ok(new ApiResponse<>("Đã đánh dấu giảng viên đã nghỉ", dto)))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ApiResponse<>("Không tìm thấy giảng viên", null)));
    }

    private String getSiteURL(HttpServletRequest request) {
        String siteURL = request.getRequestURL().toString();
        return siteURL.replace(request.getServletPath(), "");
    }
}
