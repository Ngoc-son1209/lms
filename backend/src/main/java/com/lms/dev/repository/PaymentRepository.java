package com.lms.dev.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.lms.dev.entity.Payment;

public interface PaymentRepository extends JpaRepository<Payment, UUID> {
    Optional<Payment> findByVnpTxnRef(String ref);

    List<Payment> findByStatusIgnoreCase(String status);
}
