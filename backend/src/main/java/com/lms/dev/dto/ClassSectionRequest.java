package com.lms.dev.dto;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClassSectionRequest {
    private UUID courseId;
    private String name;
    private String code;
    private UUID instructorId;
    private Integer capacity;
    private String status; // ACTIVE/INACTIVE/ARCHIVED
}

