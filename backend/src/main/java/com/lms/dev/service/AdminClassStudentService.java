package com.lms.dev.service;

import com.lms.dev.dto.AdminStudentDTO;
import com.lms.dev.entity.ClassSection;
import com.lms.dev.entity.Course;
import com.lms.dev.entity.Learning;
import com.lms.dev.entity.Progress;
import com.lms.dev.entity.User;
import com.lms.dev.repository.ClassSectionRepository;
import com.lms.dev.repository.CourseRepository;
import com.lms.dev.repository.LearningRepository;
import com.lms.dev.repository.ProgressRepository;
import com.lms.dev.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Service
public class AdminClassStudentService {

    private final ClassSectionRepository classSectionRepository;
    private final LearningRepository learningRepository;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final ProgressRepository progressRepository;
    private final CourseAvailabilityService courseAvailabilityService;

    public List<AdminStudentDTO> listStudentsInClass(UUID classSectionId) {
        ClassSection cs = classSectionRepository.findById(classSectionId)
                .orElseThrow(() -> new IllegalArgumentException("Class section not found"));

        Course course = cs.getCourse();
        return learningRepository.findByClassSection(cs)
                .stream()
                .map(l -> toDto(l, course, cs))
                .collect(Collectors.toList());
    }

    @Transactional
    public Learning assignStudentToClass(UUID classSectionId, UUID userId) {
        ClassSection cs = classSectionRepository.findById(classSectionId)
                .orElseThrow(() -> new IllegalArgumentException("Class section not found"));
        Course course = cs.getCourse();

        // capacity check
        ensureCapacity(cs);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Option B: nếu chưa có Learning thì tạo enroll luôn
        Learning learning = learningRepository.findByUserAndCourse(user, course);
        if (learning == null) {
            Progress progress = new Progress();
            progress.setUser(user);
            progress.setCourse(course);
            progressRepository.save(progress);

            learning = new Learning();
            learning.setUser(user);
            learning.setCourse(course);
        }

        learning.setClassSection(cs);
        Learning saved = learningRepository.save(learning);

        // refresh course availability
        try {
            courseAvailabilityService.refreshAndSave(course);
        } catch (Exception ignored) {
        }

        return saved;
    }

    @Transactional
    public Learning moveStudent(UUID fromClassId, UUID userId, UUID toClassId) {
        ClassSection from = classSectionRepository.findById(fromClassId)
                .orElseThrow(() -> new IllegalArgumentException("From class not found"));
        ClassSection to = classSectionRepository.findById(toClassId)
                .orElseThrow(() -> new IllegalArgumentException("To class not found"));

        if (!from.getCourse().getCourse_id().equals(to.getCourse().getCourse_id())) {
            throw new IllegalStateException("Không thể chuyển lớp khác khóa học");
        }

        ensureCapacity(to);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Learning learning = learningRepository.findByUserAndCourse(user, from.getCourse());
        if (learning == null) {
            throw new IllegalStateException("Học viên chưa enroll khóa học này");
        }

        // nếu fromClassId được truyền mà hiện tại learning.classSection khác, vẫn cho chuyển
        learning.setClassSection(to);
        Learning saved = learningRepository.save(learning);

        try {
            courseAvailabilityService.refreshAndSave(to.getCourse());
        } catch (Exception ignored) {
        }

        return saved;
    }

    public List<AdminStudentDTO> listUnassignedPaidStudents(UUID courseId) {
        // # NOTE: theo yêu cầu: danh sách học viên đã thanh toán thành công và enroll nhưng chưa có lớp.
        // Ở hệ thống hiện tại, enroll tạo record Learning; khi thiếu lớp => classSection null.
        Course course = null;
        if (courseId != null) {
            course = courseRepository.findById(courseId).orElseThrow(() -> new IllegalArgumentException("Course not found"));
            final Course finalCourse = course;
            return learningRepository.findByCourse(finalCourse).stream()
                    .filter(l -> l.getClassSection() == null)
                    .map(l -> toDto(l, finalCourse, null))
                    .collect(Collectors.toList());
        }

        // toàn hệ thống
        return learningRepository.findAll().stream()
                .filter(l -> l.getClassSection() == null)
                .map(l -> toDto(l, l.getCourse(), null))
                .collect(Collectors.toList());
    }

    private void ensureCapacity(ClassSection cs) {
        Integer cap = cs.getCapacity();
        if (cap == null) return;
        long cnt = learningRepository.countByClassSection(cs);
        if (cnt >= cap) {
            throw new IllegalStateException("Lớp đã đủ số lượng (capacity)");
        }
    }

    private AdminStudentDTO toDto(Learning l, Course course, ClassSection cs) {
        User u = l.getUser();
        ClassSection effective = (cs != null) ? cs : l.getClassSection();
        return AdminStudentDTO.builder()
                .userId(u.getId())
                .username(u.getUsername())
                .email(u.getEmail())
                .mobileNumber(u.getMobileNumber())
                .courseId(course != null ? course.getCourse_id() : null)
                .courseName(course != null ? course.getCourse_name() : null)
                .classSectionId(effective != null ? effective.getId() : null)
                .classSectionName(effective != null ? effective.getName() : null)
                .classSectionCode(effective != null ? effective.getCode() : null)
                .build();
    }
}

