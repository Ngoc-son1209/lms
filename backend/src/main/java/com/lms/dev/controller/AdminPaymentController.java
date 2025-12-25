package com.lms.dev.controller;

import com.lms.dev.dto.ApiResponse;
import com.lms.dev.dto.PaymentAdminDTO;
import com.lms.dev.entity.Payment;
import com.lms.dev.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/payments")
@RequiredArgsConstructor
public class AdminPaymentController {

    private final PaymentRepository paymentRepository;

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<ApiResponse<List<PaymentAdminDTO>>> listPayments(
            @RequestParam(required = false) String status
    ) {
        List<Payment> payments = paymentRepository.findAll();
        if (status != null && !status.isBlank()) {
            payments = payments.stream().filter(p -> status.equalsIgnoreCase(p.getStatus())).collect(Collectors.toList());
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
}
