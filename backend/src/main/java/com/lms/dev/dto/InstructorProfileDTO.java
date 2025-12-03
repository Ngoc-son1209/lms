package com.lms.dev.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class InstructorProfileDTO {
    private String username;
    private String email;
    private String mobileNumber;
    private String dob;
    private String gender;
    private String location;
    private String profession;

    private String bio;
    private String expertise;
}

