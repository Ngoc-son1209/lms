package com.lms.dev.controller;

import com.lms.dev.dto.ApiResponse;
import com.lms.dev.dto.PaymentAdminDTO;
import com.lms.dev.dto.PaymentDetailDTO;
import com.lms.dev.entity.Course;
import com.lms.dev.entity.Payment;
import com.lms.dev.entity.User;
import com.lms.dev.repository.CourseRepository;
import com.lms.dev.repository.PaymentRepository;
import com.lms.dev.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/payments")
@RequiredArgsConstructor
public class AdminPaymentController {

    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<ApiResponse<List<PaymentAdminDTO>>> listPayments(
            @RequestParam(required = false) String status
    ) {
        List<Payment> payments;
        if (status != null && !status.isBlank()) {
            payments = paymentRepository.findByStatusIgnoreCase(status);
        } else {
            payments = paymentRepository.findAll();
        }

        List<PaymentAdminDTO> dtos = payments.stream().map(p -> PaymentAdminDTO.builder()
                .id(p.getId())
                .userId(p.getUserId())
                .courseId(p.getCourseId())
                .amount(p.getAmount())
                .status(p.getStatus())
                .orderInfo(p.getOrderInfo())
                .vnpTxnRef(p.getVnpTxnRef())
                .build()).collect(Collectors.toList());

        return ResponseEntity.ok(new ApiResponse<>("OK", dtos));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{paymentId}")
    public ResponseEntity<ApiResponse<PaymentDetailDTO>> getPaymentDetail(@PathVariable UUID paymentId) {
        Payment p = paymentRepository.findById(paymentId).orElse(null);
        if (p == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse<>("Payment not found", null));
        }

        User u = (p.getUserId() != null) ? userRepository.findById(p.getUserId()).orElse(null) : null;
        Course c = (p.getCourseId() != null) ? courseRepository.findById(p.getCourseId()).orElse(null) : null;

        PaymentDetailDTO dto = PaymentDetailDTO.builder()
                .id(p.getId())
                .userId(p.getUserId())
                .userName(u != null ? u.getUsername() : null)
                .userEmail(u != null ? u.getEmail() : null)
                .courseId(p.getCourseId())
                .courseName(c != null ? c.getCourse_name() : null)
                .amount(p.getAmount())
                .status(p.getStatus())
                .orderInfo(p.getOrderInfo())
                .vnpTxnRef(p.getVnpTxnRef())
                .build();

        return ResponseEntity.ok(new ApiResponse<>("OK", dto));
    }
}
