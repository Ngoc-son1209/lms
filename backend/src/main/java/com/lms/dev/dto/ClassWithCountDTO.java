package com.lms.dev.dto;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClassWithCountDTO {
    private UUID id;
    private UUID courseId;
    private String name;
    private String code;
    private UUID instructorId;
    private String instructorName;
    private Integer capacity;
    private String status;
    private long currentStudentCount;
}
