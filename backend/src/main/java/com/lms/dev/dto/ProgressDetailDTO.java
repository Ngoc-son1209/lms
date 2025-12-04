package com.lms.dev.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProgressDetailDTO {
    private float playedTime;
    private float duration;
    private Integer marks; // latest or best score for this course
}
