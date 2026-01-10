package com.lms.dev.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.lms.dev.entity.ClassSection;
import com.lms.dev.entity.Course;
import com.lms.dev.entity.Learning;
import com.lms.dev.entity.User;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface LearningRepository extends JpaRepository<Learning, UUID> {

        long count();

        Learning findByUserAndCourse(User user, Course course);

        List<Learning> findByCourse(Course course);

        long countByCourse(Course course);

        long countByClassSection(ClassSection classSection);

        List<Learning> findByClassSection(ClassSection classSection);

        // ===== Added for admin class-student management =====
        @Query("SELECT l FROM Learning l WHERE l.classSection.id = :classSectionId")
        List<Learning> findByClassSectionId(@Param("classSectionId") UUID classSectionId);

        @Query("SELECT COUNT(l) FROM Learning l WHERE l.classSection.id = :classSectionId")
        long countByClassSectionId(@Param("classSectionId") UUID classSectionId);

        @Query("SELECT l FROM Learning l WHERE l.user.id = :userId AND l.course.course_id = :courseId")
        Optional<Learning> findByUserIdAndCourseId(@Param("userId") UUID userId, @Param("courseId") UUID courseId);

        @Query("SELECT l FROM Learning l WHERE l.user.id = :userId AND l.classSection.id = :classSectionId")
        Optional<Learning> findByUserIdAndClassSectionId(@Param("userId") UUID userId,
                        @Param("classSectionId") UUID classSectionId);

        @Query("SELECT l FROM Learning l WHERE l.user.id = :userId AND l.course.course_id = :courseId AND l.classSection IS NULL")
        Optional<Learning> findPendingClassAssignment(@Param("userId") UUID userId, @Param("courseId") UUID courseId);

        @Query("SELECT l FROM Learning l WHERE l.course.course_id = :courseId AND l.classSection IS NULL")
        List<Learning> findPendingClassAssignmentsByCourse(@Param("courseId") UUID courseId);

        // ===== Existing instructor filters =====
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
