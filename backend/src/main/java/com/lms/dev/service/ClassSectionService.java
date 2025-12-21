package com.lms.dev.service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.lms.dev.dto.ClassSectionRequest;
import com.lms.dev.dto.ClassWithCountDTO;
import com.lms.dev.entity.ClassSection;
import com.lms.dev.entity.Course;
import com.lms.dev.repository.ClassSectionRepository;
import com.lms.dev.repository.CourseRepository;
import com.lms.dev.repository.LearningRepository;
import com.lms.dev.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ClassSectionService {

    private final ClassSectionRepository classRepo;
    private final CourseRepository courseRepo;
    private final LearningRepository learningRepo;
    private final UserRepository userRepository;

    public List<ClassWithCountDTO> getByCourse(UUID courseId) {
        Course course = courseRepo.findById(courseId).orElse(null);
        if (course == null) return List.of();
        List<ClassSection> list = classRepo.findByCourse(course);
        return list.stream().map(cs -> {
            String instructorName = null;
            if (cs.getInstructorId() != null) {
                var u = userRepository.findById(cs.getInstructorId()).orElse(null);
                if (u != null) instructorName = u.getUsername() != null ? u.getUsername() : u.getEmail();
            }
            return ClassWithCountDTO.builder()
                .id(cs.getId())
                .courseId(course.getCourse_id())
                .name(cs.getName())
                .code(cs.getCode())
                .instructorId(cs.getInstructorId())
                .instructorName(instructorName)
                .capacity(cs.getCapacity())
                .status(cs.getStatus())
                .currentStudentCount(learningRepo.countByClassSection(cs))
                .build();
        }).collect(Collectors.toList());
    }

    @Transactional
    public ClassWithCountDTO create(ClassSectionRequest req) {
        if (req.getCourseId() == null) {
            throw new IllegalArgumentException("courseId is required");
        }
        if (req.getName() == null || req.getName().isBlank()) {
            throw new IllegalArgumentException("name is required");
        }
        if (req.getCapacity() != null && req.getCapacity() < 0) {
            throw new IllegalArgumentException("capacity must be >= 0");
        }
        Course course = courseRepo.findById(req.getCourseId())
                .orElseThrow(() -> new IllegalArgumentException("Course not found"));
        ClassSection cs = new ClassSection();
        cs.setCourse(course);
        cs.setName(req.getName());
        cs.setCode(req.getCode());
        cs.setInstructorId(req.getInstructorId());
        cs.setCapacity(req.getCapacity());
        cs.setStatus(req.getStatus() == null ? "ACTIVE" : req.getStatus());
        ClassSection saved = classRepo.save(cs);
        return toDTO(saved);
    }

    @Transactional
    public ClassWithCountDTO update(UUID id, ClassSectionRequest req) {
        ClassSection cs = classRepo.findById(id).orElseThrow();
        if (req.getName() != null) cs.setName(req.getName());
        if (req.getCode() != null) cs.setCode(req.getCode());
        if (req.getInstructorId() != null) cs.setInstructorId(req.getInstructorId());
        if (req.getCapacity() != null) cs.setCapacity(req.getCapacity());
        if (req.getStatus() != null) cs.setStatus(req.getStatus());
        ClassSection saved = classRepo.save(cs);
        return toDTO(saved);
    }

    @Transactional
    public void delete(UUID id) {
        classRepo.deleteById(id);
    }

    private ClassWithCountDTO toDTO(ClassSection cs) {
        long cnt = 0L;
        try {
            cnt = learningRepo.countByClassSection(cs);
        } catch (Exception ignored) {}
        return ClassWithCountDTO.builder()
                .id(cs.getId())
                .courseId(cs.getCourse().getCourse_id())
                .name(cs.getName())
                .code(cs.getCode())
                .instructorId(cs.getInstructorId())
                .capacity(cs.getCapacity())
                .status(cs.getStatus())
                .currentStudentCount(cnt)
                .build();
    }
}

