package com.lms.dev.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import org.hibernate.annotations.GenericGenerator;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "users", uniqueConstraints = {@UniqueConstraint(columnNames = "email")})
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class User {
    @Id
    @GeneratedValue(generator = "uuid2")
    @GenericGenerator(name = "uuid2", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(name = "id", updatable = false, nullable = false, columnDefinition = "BINARY(16)")
    private UUID id;

    @NotBlank
    private String username;

    @NotBlank
    @Email
    @Column(unique = true)
    private String email;

    @NotBlank
    @JsonIgnore
    private String password;

    private String mobileNumber;
    private String dob;
    private String gender;
    private String location;
    private String profession;

    @Lob
    @Column(columnDefinition = "LONGBLOB")
    private byte[] profileImage;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Learning> learningCourses;

    private boolean enabled = true;

    @Column(name = "verification_code", length = 64)
    @JsonIgnore
    private String verificationCode;

    @Column(name = "password_reset_token", length = 64)
    @JsonIgnore
    private String passwordResetToken;

    @Column(name = "password_reset_token_expiry")
    @JsonIgnore
    private LocalDateTime passwordResetTokenExpiry;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
