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
public class PaymentDetailDTO {
    private UUID id;

    private UUID userId;
    private String userName;
    private String userEmail;

    private UUID courseId;
    private String courseName;

    private Double amount;
    private String status;
    private String orderInfo;
    private String vnpTxnRef;
}

