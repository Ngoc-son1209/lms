package com.lms.dev.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class StudentDetailDTO {
    private UUID id; // User ID
    private String username;
    private String email;
    private String mobileNumber;
    
    // Progress and score
    private Integer progressPercent;
    private Integer score;
    
    // Class and Course info
    private UUID classId;
    private String className;
    private String classCode;
    private UUID courseId;
    private String courseName;
}

