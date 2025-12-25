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
public class ClassStudentDTO {
    private UUID userId;
    private String username;
    private String email;
    private String mobileNumber;
    private UUID courseId;
    private String courseName;
    private UUID classSectionId;
    private String classSectionName;
}

