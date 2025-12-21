package com.lms.dev.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ClassSectionDetailDTO {
    private UUID id;
    private String name;
    private String code;
    private UUID instructorId;
    private String instructorName;
    private Integer capacity;
    private Integer currentStudentCount;
    private String status;
    
    // Course info
    private CourseBasicDTO course;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class CourseBasicDTO {
        private UUID course_id;
        private String course_name;
        private String description;
    }
}

