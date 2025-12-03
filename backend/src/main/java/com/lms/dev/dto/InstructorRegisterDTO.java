package com.lms.dev.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class InstructorRegisterDTO {
    @NotBlank
    private String fullName;

    @NotBlank
    @Email
    private String email;

    @NotBlank
    private String password;

    @NotBlank
    private String bio;

    @NotBlank
    private String expertise;

    // Thông tin cá nhân lưu trong bảng users
    private String mobileNumber; // Số điện thoại
    private String dob; // Ngày sinh (string để tương thích hiện tại)
    private String gender; // Giới tính
    private String location; // Địa chỉ/khu vực
    private String profession; // Nghề nghiệp
}
