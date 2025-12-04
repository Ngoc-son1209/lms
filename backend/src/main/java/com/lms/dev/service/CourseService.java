package com.lms.dev.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import com.lms.dev.dto.CourseWithCountDTO;
import com.lms.dev.entity.Course;
import com.lms.dev.repository.CourseRepository;
import com.lms.dev.repository.LearningRepository;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Service
public class CourseService {

    private final CourseRepository courseRepository;
    private final LearningRepository learningRepository;

    public List<Course> getAllCourses() {
        return courseRepository.findAll();
    }

    public List<Course> getCoursesByInstructor(UUID instructorId) {
        return courseRepository.findByInstructorId(instructorId);
    }

    private CourseWithCountDTO toWithCount(Course c) {
        long cnt = 0L;
        try {
            cnt = learningRepository.countByCourse(c);
        } catch (Exception ignored) {
        }
        return CourseWithCountDTO.builder()
                .course_id(c.getCourse_id())
                .instructorId(c.getInstructorId())
                .course_name(c.getCourse_name())
                .price(c.getPrice())
                .instructor(c.getInstructor())
                .description(c.getDescription())
                .p_link(c.getP_link())
                .y_link(c.getY_link())
                .studentCount(cnt)
                .build();
    }

    public List<CourseWithCountDTO> getAllWithCount() {
        return courseRepository.findAll().stream().map(this::toWithCount).collect(Collectors.toList());
    }

    public List<CourseWithCountDTO> getByInstructorWithCount(UUID instructorId) {
        return courseRepository.findByInstructorId(instructorId).stream().map(this::toWithCount)
                .collect(Collectors.toList());
    }

    public Course getCourseById(UUID id) {
        return courseRepository.findById(id).orElse(null);
    }

    public Course createCourse(Course course) {
        return courseRepository.save(course);
    }

    public Course save(Course course) {
        return courseRepository.save(course);
    }

    public Course updateCourse(UUID id, Course updatedCourse) {
        Course existingCourse = courseRepository.findById(id).orElse(null);
        if (existingCourse != null) {
            existingCourse.setCourse_name(updatedCourse.getCourse_name());
            existingCourse.setDescription(updatedCourse.getDescription());
            existingCourse.setP_link(updatedCourse.getP_link());
            existingCourse.setPrice(updatedCourse.getPrice());
            if (updatedCourse.getInstructor() != null) {
                existingCourse.setInstructor(updatedCourse.getInstructor());
            }
            existingCourse.setY_link(updatedCourse.getY_link());
            // keep or update instructorId if provided (controller enforces ownership)
            if (updatedCourse.getInstructorId() != null) {
                existingCourse.setInstructorId(updatedCourse.getInstructorId());
            }
            return courseRepository.save(existingCourse);
        }
        return null;
    }

    public void deleteCourse(UUID id) {
        courseRepository.deleteById(id);
    }
}
