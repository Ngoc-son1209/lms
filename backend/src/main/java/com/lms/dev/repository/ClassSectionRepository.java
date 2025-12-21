package com.lms.dev.repository;

import com.lms.dev.entity.ClassSection;
import com.lms.dev.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ClassSectionRepository extends JpaRepository<ClassSection, UUID> {
    List<ClassSection> findByCourse(Course course);
    List<ClassSection> findByCourseAndStatus(Course course, String status);
    List<ClassSection> findByInstructorId(UUID instructorId);
    List<ClassSection> findByInstructorIdAndCourse(UUID instructorId, Course course);
}

