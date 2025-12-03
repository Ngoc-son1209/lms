package com.lms.dev.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import com.lms.dev.entity.Course;
import com.lms.dev.repository.CourseRepository;

import java.util.List;
import java.util.UUID;

@RequiredArgsConstructor
@Service
public class CourseService {

    private final CourseRepository courseRepository;

    public List<Course> getAllCourses() {
        return courseRepository.findAll();
    }

    public List<Course> getCoursesByInstructor(UUID instructorId) {
        return courseRepository.findByInstructorId(instructorId);
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
