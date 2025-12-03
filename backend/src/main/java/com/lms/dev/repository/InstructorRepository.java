package com.lms.dev.repository;

import com.lms.dev.entity.Instructor;
import com.lms.dev.enums.ApprovalStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface InstructorRepository extends JpaRepository<Instructor, UUID> {
    Optional<Instructor> findByEmail(String email);

    boolean existsByEmail(String email);

    List<Instructor> findByStatus(ApprovalStatus status);
}
