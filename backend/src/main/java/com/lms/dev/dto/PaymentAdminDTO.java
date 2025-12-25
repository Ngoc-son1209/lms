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
public class PaymentAdminDTO {
    private UUID id;
    private UUID userId;
    private UUID courseId;
    private Double amount;
    private String status;
    private String orderInfo;
    private String vnpTxnRef;
}
