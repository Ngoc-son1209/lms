package com.lms.dev.entity;

import java.time.LocalDateTime;
import java.util.UUID;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.GenericGenerator;

@Entity
@Table(name = "class_sections")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ClassSection {

    @Id
    @GeneratedValue(generator = "uuid2")
    @GenericGenerator(name = "uuid2", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(name = "id", updatable = false, nullable = false, columnDefinition = "BINARY(16)")
    private UUID id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false, columnDefinition = "BINARY(16)")
    private Course course;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(length = 50)
    private String code; // optional, unique within a course (enforce at DB migration if needed)

    @Column(name = "instructor_id", columnDefinition = "BINARY(16)")
    private UUID instructorId; // assign teacher at class level

    @Column
    private Integer capacity; // null = unlimited

    @Column(length = 20, nullable = false)
    private String status = "ACTIVE"; // ACTIVE/INACTIVE/ARCHIVED

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}

