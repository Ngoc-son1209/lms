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
    private final CourseAvailabilityService courseAvailabilityService;

    public List<Course> getAllCourses() {
        // # NOTE: Tự động refresh trạng thái còn chỗ/full mỗi lần query list (đơn giản, đảm bảo luôn đúng)
        List<Course> courses = courseRepository.findAll();
        for (Course c : courses) {
            try {
                courseAvailabilityService.refreshAndSave(c);
            } catch (Exception ignored) {
            }
        }
        return courses;
    }

    private CourseWithCountDTO toWithCount(Course c) {
        long cnt = 0L;
        try {
            cnt = learningRepository.countByCourse(c);
        } catch (Exception ignored) {
        }
        return CourseWithCountDTO.builder()
                .course_id(c.getCourse_id())
                .course_name(c.getCourse_name())
                .price(c.getPrice())
                .description(c.getDescription())
                .p_link(c.getP_link())
                .y_link(c.getY_link())
                .startAt(c.getStartAt())
                .endAt(c.getEndAt())
                .studentCount(cnt)
                .availabilityStatus(c.getAvailabilityStatus())
                .build();
    }

    public List<CourseWithCountDTO> getAllWithCount() {
        List<Course> courses = courseRepository.findAll();
        for (Course c : courses) {
            try {
                courseAvailabilityService.refreshAndSave(c);
            } catch (Exception ignored) {
            }
        }
        return courses.stream().map(this::toWithCount).collect(Collectors.toList());
    }

    public Course getCourseById(UUID id) {
        Course c = courseRepository.findById(id).orElse(null);
        if (c != null) {
            try {
                courseAvailabilityService.refreshAndSave(c);
            } catch (Exception ignored) {
            }
        }
        return c;
    }

    public Course createCourse(Course course) {
        validateDates(course.getStartAt(), course.getEndAt());
        return courseRepository.save(course);
    }

    private void validateDates(java.time.LocalDate start, java.time.LocalDate end) {
        if (start != null && end != null) {
            if (!end.isAfter(start)) {
                throw new IllegalArgumentException("End date must be after start date");
            }
        }
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
            existingCourse.setY_link(updatedCourse.getY_link());
            validateDates(updatedCourse.getStartAt(), updatedCourse.getEndAt());
            existingCourse.setStartAt(updatedCourse.getStartAt());
            existingCourse.setEndAt(updatedCourse.getEndAt());
            return courseRepository.save(existingCourse);
        }
        return null;
    }

    public void deleteCourse(UUID id) {
        courseRepository.deleteById(id);
    }
}
