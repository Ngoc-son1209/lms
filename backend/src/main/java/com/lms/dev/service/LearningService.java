package com.lms.dev.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.lms.dev.dto.ClassSectionDetailDTO;
import com.lms.dev.dto.EnrollRequest;
import com.lms.dev.dto.StudentDTO;
import com.lms.dev.dto.StudentDetailDTO;
import com.lms.dev.entity.Assessment;
import com.lms.dev.entity.ClassSection;
import com.lms.dev.entity.Course;
import com.lms.dev.entity.Learning;
import com.lms.dev.entity.Progress;
import com.lms.dev.entity.User;
import com.lms.dev.repository.AssessmentRepository;
import com.lms.dev.repository.ClassSectionRepository;
import com.lms.dev.repository.CourseRepository;
import com.lms.dev.repository.LearningRepository;
import com.lms.dev.repository.ProgressRepository;
import com.lms.dev.repository.UserRepository;
import java.util.*;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Service
public class LearningService {

    private final LearningRepository learningRepository;

    private final UserRepository userRepository;

    private final CourseRepository courseRepository;

    private final ProgressRepository progressRepository;

    private final ClassSectionRepository classSectionRepository;

    private final AssessmentRepository assessmentRepository;

    public List<Course> getLearningCourses(UUID userId) {
        Optional<User> optionalUser = userRepository.findById(userId);

        if (optionalUser.isPresent()) {
            User user = optionalUser.get();
            List<Course> learningCourses = new ArrayList<>();

            for (Learning learning : user.getLearningCourses()) {
                Course course = learning.getCourse();
                learningCourses.add(course);
            }

            return learningCourses;
        }

        return null;
    }

    public List<Learning> getEnrollments() {
        return learningRepository.findAll();
    }

    public String enrollCourse(EnrollRequest enrollRequest) {
        User user = userRepository.findById(enrollRequest.getUserId()).orElse(null);
        Course course = courseRepository.findById(enrollRequest.getCourseId()).orElse(null);

        if (user != null && course != null) {
            Learning existingLearning = learningRepository.findByUserAndCourse(user, course);
            if (existingLearning != null) {
                return "Course already enrolled";
            }

            Progress progress = new Progress();
            progress.setUser(user);
            progress.setCourse(course);
            progressRepository.save(progress);

            Learning learning = new Learning();
            learning.setUser(user);
            learning.setCourse(course);
            learningRepository.save(learning);

            return "Enrolled successfully";
        }

        return "Failed to enroll";
    }

    public void unenrollCourse(UUID id) {
        learningRepository.deleteById(id);
    }

    // New: list students by course
    public List<StudentDTO> getStudentsByCourse(UUID courseId) {
        Course course = courseRepository.findById(courseId).orElse(null);
        if (course == null)
            return Collections.emptyList();
        List<Learning> records = learningRepository.findByCourse(course);
        return records.stream()
                .map(l -> {
                    User u = l.getUser();
                    return new StudentDTO(u.getId(), u.getUsername(), u.getEmail(), u.getMobileNumber());
                })
                .collect(Collectors.toList());
    }

    // New: Get students by instructor with filters (courseId, classSectionId)
    public List<StudentDetailDTO> getStudentsByInstructor(UUID instructorId, UUID courseId, UUID classSectionId) {
        List<Learning> learningRecords;

        // Apply filters based on provided parameters
        if (courseId != null && classSectionId != null) {
            learningRecords = learningRepository.findByInstructorIdAndCourseIdAndClassSectionId(instructorId, courseId,
                    classSectionId);
        } else if (courseId != null) {
            learningRecords = learningRepository.findByInstructorIdAndCourseId(instructorId, courseId);
        } else if (classSectionId != null) {
            learningRecords = learningRepository.findByInstructorIdAndClassSectionId(instructorId, classSectionId);
        } else {
            learningRecords = learningRepository.findByInstructorId(instructorId);
        }

        // Map to StudentDetailDTO with progress and score
        return learningRecords.stream()
                .map(learning -> {
                    User user = learning.getUser();
                    Course course = learning.getCourse();
                    ClassSection classSection = learning.getClassSection();

                    // Get progress information
                    Progress progress = progressRepository.findByUserAndCourse(user, course);
                    Integer progressPercent = 0;
                    Integer score = null;

                    if (progress != null) {
                        float playedTime = progress.getPlayedTime();
                        float duration = progress.getDuration();
                        if (duration > 0) {
                            progressPercent = Math.min(100, (int) Math.ceil((playedTime * 100.0) / duration));
                        }
                    }

                    // Get score from Assessment
                    List<Assessment> assessments = assessmentRepository.findByUserAndCourse(user, course);
                    if (assessments != null && !assessments.isEmpty()) {
                        // Get the latest or highest score
                        score = assessments.stream()
                                .mapToInt(Assessment::getMarks)
                                .max()
                                .orElse(0);
                    }

                    return StudentDetailDTO.builder()
                            .id(user.getId())
                            .username(user.getUsername())
                            .email(user.getEmail())
                            .mobileNumber(user.getMobileNumber())
                            .progressPercent(progressPercent)
                            .score(score)
                            .classId(classSection != null ? classSection.getId() : null)
                            .className(classSection != null ? classSection.getName() : null)
                            .classCode(classSection != null ? classSection.getCode() : null)
                            .courseId(course.getCourse_id())
                            .courseName(course.getCourse_name())
                            .build();
                })
                .collect(Collectors.toList());
    }

    // Get classes by student (current user) with full details
    public List<ClassSectionDetailDTO> getClassesByStudent(UUID studentId) {
        User student = userRepository.findById(studentId).orElse(null);
        if (student == null) {
            return Collections.emptyList();
        }

        List<Learning> learningRecords = learningRepository.findByUser(student);

        // Collect unique class sections from enrollments
        Map<UUID, ClassSection> classSectionMap = new LinkedHashMap<>();
        for (Learning learning : learningRecords) {
            ClassSection cs = learning.getClassSection();
            if (cs != null && cs.getId() != null) {
                classSectionMap.putIfAbsent(cs.getId(), cs);
            }
        }

        return classSectionMap.values().stream()
                .map(classSection -> {
                    Course course = classSection.getCourse();

                    String instructorName = null;
                    if (classSection.getInstructorId() != null) {
                        User instructor = userRepository.findById(classSection.getInstructorId()).orElse(null);
                        if (instructor != null) {
                            instructorName = instructor.getUsername();
                        }
                    }

                    int studentCount = (int) learningRepository.countByClassSection(classSection);

                    return ClassSectionDetailDTO.builder()
                            .id(classSection.getId())
                            .name(classSection.getName())
                            .code(classSection.getCode())
                            .instructorId(classSection.getInstructorId())
                            .instructorName(instructorName)
                            .capacity(classSection.getCapacity())
                            .currentStudentCount(studentCount)
                            .status(classSection.getStatus())
                            .course(ClassSectionDetailDTO.CourseBasicDTO.builder()
                                    .course_id(course.getCourse_id())
                                    .course_name(course.getCourse_name())
                                    .description(course.getDescription())
                                    .build())
                            .createdAt(classSection.getCreatedAt())
                            .updatedAt(classSection.getUpdatedAt())
                            .build();
                })
                .collect(Collectors.toList());
    }

    // Get classes by instructor with full details
    public List<ClassSectionDetailDTO> getClassesByInstructor(UUID instructorId, UUID courseId) {
        List<ClassSection> classSections;

        if (courseId != null) {
            Course course = courseRepository.findById(courseId).orElse(null);
            if (course == null)
                return Collections.emptyList();
            classSections = classSectionRepository.findByInstructorIdAndCourse(instructorId, course);
        } else {
            classSections = classSectionRepository.findByInstructorId(instructorId);
        }

        // Map to DTO with full details
        return classSections.stream()
                .map(classSection -> {
                    Course course = classSection.getCourse();

                    // Get instructor name
                    String instructorName = null;
                    if (classSection.getInstructorId() != null) {
                        User instructor = userRepository.findById(classSection.getInstructorId()).orElse(null);
                        if (instructor != null) {
                            instructorName = instructor.getUsername();
                        }
                    }

                    // Count students in this class
                    int studentCount = (int) learningRepository.countByClassSection(classSection);

                    return ClassSectionDetailDTO.builder()
                            .id(classSection.getId())
                            .name(classSection.getName())
                            .code(classSection.getCode())
                            .instructorId(classSection.getInstructorId())
                            .instructorName(instructorName)
                            .capacity(classSection.getCapacity())
                            .currentStudentCount(studentCount)
                            .status(classSection.getStatus())
                            .course(ClassSectionDetailDTO.CourseBasicDTO.builder()
                                    .course_id(course.getCourse_id())
                                    .course_name(course.getCourse_name())
                                    .description(course.getDescription())
                                    .build())
                            .createdAt(classSection.getCreatedAt())
                            .updatedAt(classSection.getUpdatedAt())
                            .build();
                })
                .collect(Collectors.toList());
    }
}
