package com.lms.dev.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InstructorAdminDTO {
    private UUID id; // Instructor.id
    private UUID userId; // User.id (đăng nhập)
    private String fullName;
    private String email;
    private String bio;
    private String expertise;

    // Trạng thái duyệt
    private String status; // PENDING/APPROVED/REJECTED
    private String rejectReason; // nếu bị từ chối

    // Từ bảng users
    private String mobileNumber;
    private String dob;
    private String gender;
    private String location;
    private String profession;
    private boolean emailVerified; // user.enabled
    private boolean approved; // user.approved

    private LocalDateTime createdAt; // instructor.createdAt
    private LocalDateTime updatedAt; // instructor.updatedAt
}
