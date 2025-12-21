package com.lms.dev.entity;
import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.GenericGenerator;

import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "learning", uniqueConstraints = { @UniqueConstraint(columnNames = { "user_id", "course_id" }) })
public class Learning {
    @Id
    @GeneratedValue(generator = "uuid2")
    @GenericGenerator(name = "uuid2", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(name = "id", updatable = false, nullable = false, columnDefinition = "BINARY(16)")
    private UUID id;

    @ManyToOne(optional = false)
    @JsonIgnore
    @JoinColumn(name = "user_id", nullable = false, columnDefinition = "BINARY(16)")
    private User user;

    @ManyToOne(optional = false)
    @JsonIgnore
    @JoinColumn(name = "course_id", nullable = false, columnDefinition = "BINARY(16)")
    private Course course;

    @ManyToOne(optional = true)
    @JsonIgnore
    @JoinColumn(name = "class_section_id", nullable = true, columnDefinition = "BINARY(16)")
    private ClassSection classSection;
}
