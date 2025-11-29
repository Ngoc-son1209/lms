package com.lms.dev.repository;

import com.lms.dev.enums.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.lms.dev.entity.User;

import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {

    User findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByMobileNumber(String mobileNumber);

    boolean existsByRole(UserRole role);

    User findByEmailAndPassword(String email, String password);

    @Query("SELECT u FROM User u WHERE u.verificationCode = ?1")
    User findByVerificationCode(String code);

    // # NOTE: Tìm user bằng password reset token
    @Query("SELECT u FROM User u WHERE u.passwordResetToken = ?1")
    User findByPasswordResetToken(String token);
}