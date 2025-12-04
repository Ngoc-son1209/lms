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
public class CourseWithCountDTO {
    private UUID course_id;
    private UUID instructorId;
    private String course_name;
    private Integer price;
    private String instructor;
    private String description;
    private String p_link;
    private String y_link;
    private long studentCount;
}
