package com.lms.dev.entity;

import java.util.UUID;

import org.hibernate.annotations.GenericGenerator;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import lombok.Data;

@Data
@Entity
public class Payment {
    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(updatable = false, nullable = false)
    private UUID id; 

    private UUID userId; 

    // # NOTE: Khóa học được thanh toán
    private UUID courseId;

    private Double amount;

    private String status; // PENDING, PAID, FAILED

    private String orderInfo;

    private String vnpTxnRef;
    
}
