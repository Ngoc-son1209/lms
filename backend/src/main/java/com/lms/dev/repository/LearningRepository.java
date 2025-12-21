package com.lms.dev.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.lms.dev.entity.ClassSection;
import com.lms.dev.entity.Course;
import com.lms.dev.entity.Learning;
import com.lms.dev.entity.User;

import java.util.List;
import java.util.UUID;

public interface LearningRepository extends JpaRepository<Learning, UUID> {

    Learning findByUserAndCourse(User user, Course course);

    List<Learning> findByCourse(Course course);

    long countByCourse(Course course);

    long countByClassSection(ClassSection classSection);

    List<Learning> findByClassSection(ClassSection classSection);

    @Query("SELECT l FROM Learning l WHERE l.classSection.instructorId = :instructorId")
    List<Learning> findByInstructorId(@Param("instructorId") UUID instructorId);

    @Query("SELECT l FROM Learning l WHERE l.classSection.instructorId = :instructorId AND l.course.course_id = :courseId")
    List<Learning> findByInstructorIdAndCourseId(@Param("instructorId") UUID instructorId,
            @Param("courseId") UUID courseId);

    @Query("SELECT l FROM Learning l WHERE l.classSection.instructorId = :instructorId AND l.classSection.id = :classSectionId")
    List<Learning> findByInstructorIdAndClassSectionId(@Param("instructorId") UUID instructorId,
            @Param("classSectionId") UUID classSectionId);

    @Query("SELECT l FROM Learning l WHERE l.classSection.instructorId = :instructorId AND l.course.course_id = :courseId AND l.classSection.id = :classSectionId")
    List<Learning> findByInstructorIdAndCourseIdAndClassSectionId(@Param("instructorId") UUID instructorId,
            @Param("courseId") UUID courseId, @Param("classSectionId") UUID classSectionId);
}
