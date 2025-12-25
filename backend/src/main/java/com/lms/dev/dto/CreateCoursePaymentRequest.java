package com.lms.dev.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class CreateCoursePaymentRequest {
    @NotNull
    private UUID courseId;
}

