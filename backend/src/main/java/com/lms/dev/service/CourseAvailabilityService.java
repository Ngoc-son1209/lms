package com.lms.dev.service;

import com.lms.dev.entity.ClassSection;
import com.lms.dev.entity.Course;
import com.lms.dev.repository.ClassSectionRepository;
import com.lms.dev.repository.CourseRepository;
import com.lms.dev.repository.LearningRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@RequiredArgsConstructor
@Service
public class CourseAvailabilityService {

    private final CourseRepository courseRepository;
    private final ClassSectionRepository classSectionRepository;
    private final LearningRepository learningRepository;

    /**
     * # NOTE:
     * AVAILABLE nếu tồn tại ít nhất 1 lớp ACTIVE có capacity == null (unlimited) hoặc count(Learning.classSection) < capacity.
     * FULL nếu không có lớp ACTIVE nào còn chỗ.
     */
    public String computeAvailabilityStatus(Course course) {
        List<ClassSection> activeSections = classSectionRepository.findByCourseAndStatus(course, "ACTIVE");
        if (activeSections == null || activeSections.isEmpty()) {
            return "FULL";
        }

        for (ClassSection cs : activeSections) {
            Integer cap = cs.getCapacity();
            if (cap == null) {
                return "AVAILABLE";
            }
            long current = learningRepository.countByClassSection(cs);
            if (current < cap) {
                return "AVAILABLE";
            }
        }
        return "FULL";
    }

    public Course refreshAndSave(Course course) {
        String st = computeAvailabilityStatus(course);
        course.setAvailabilityStatus(st);
        return courseRepository.save(course);
    }
}

