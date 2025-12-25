package com.lms.dev.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseWithCountDTO {
    private UUID course_id;
    private String course_name;
    private Integer price;
    private String description;
    private String p_link;
    private String y_link;
    private LocalDate startAt;
    private LocalDate endAt;
    private long studentCount;
    private String availabilityStatus;
}
