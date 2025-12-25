package com.lms.dev.controller;

import com.lms.dev.dto.ApiResponse;
import com.lms.dev.dto.CreateCoursePaymentRequest;
import com.lms.dev.dto.CreatePaymentResponse;
import com.lms.dev.security.UserPrincipal;
import com.lms.dev.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Slf4j
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/course")
    public ResponseEntity<ApiResponse<CreatePaymentResponse>> createCoursePayment(
            @Valid @RequestBody CreateCoursePaymentRequest request
    ) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !(authentication.getPrincipal() instanceof UserPrincipal principal)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new ApiResponse<>("Unauthorized", null));
            }

            CreatePaymentResponse res = paymentService.createCoursePayment(principal.getId(), request.getCourseId());
            return ResponseEntity.ok(new ApiResponse<>("Created payment", res));

        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse<>(e.getMessage(), null));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse<>(e.getMessage(), null));
        } catch (Exception e) {
            log.error("Error creating course payment: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>("Lỗi server, vui lòng thử lại", null));
        }
    }
}

