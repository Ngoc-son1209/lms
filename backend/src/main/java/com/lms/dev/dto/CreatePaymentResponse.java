package com.lms.dev.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreatePaymentResponse {
    private UUID paymentId;
    private String vnpTxnRef;
    private String paymentUrl;
    private Double amount;
    private UUID courseId;
}

