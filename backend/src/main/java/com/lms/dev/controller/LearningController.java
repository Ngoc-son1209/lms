package com.lms.dev.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.lms.dev.dto.ClassSectionDetailDTO;
import com.lms.dev.dto.EnrollRequest;
import com.lms.dev.dto.StudentDetailDTO;
import com.lms.dev.entity.Course;
import com.lms.dev.entity.Learning;
import com.lms.dev.entity.User;
import com.lms.dev.repository.UserRepository;
import com.lms.dev.security.UserPrincipal;
import com.lms.dev.service.LearningService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/learning")
public class LearningController {

    @Autowired
    private LearningService learningService;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/{userId}")
    public List<Course> getLearningCourses(@PathVariable UUID userId) {
        return learningService.getLearningCourses(userId);
    }

    @GetMapping
    public List<Learning> getEnrollments() {
        return learningService.getEnrollments();
    }

    @PostMapping
    public String enrollCourse(@RequestBody EnrollRequest enrollRequest) {
        return learningService.enrollCourse(enrollRequest);
    }

    @DeleteMapping("/{id}")
    public void unenrollCourse(@PathVariable UUID id) {
        learningService.unenrollCourse(id);
    }

    // New: list students by course
    @GetMapping("/course/{courseId}/students")
    public List<com.lms.dev.dto.StudentDTO> getStudentsByCourse(@PathVariable UUID courseId) {
        return learningService.getStudentsByCourse(courseId);
    }

    // New: Get students by instructor with filters
    @PreAuthorize("hasRole('INSTRUCTOR')")
    @GetMapping("/instructor/students")
    public ResponseEntity<List<StudentDetailDTO>> getInstructorStudents(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) UUID courseId,
            @RequestParam(required = false) UUID classSectionId) {

        // Get instructor's user ID from email
        String email = principal.getEmail();
        User user = userRepository.findByEmail(email);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        System.out.println("=== DEBUG getInstructorStudents ===");
        System.out.println("Instructor email: " + email);
        System.out.println("Instructor userId: " + user.getId());
        System.out.println("CourseId filter: " + courseId);
        System.out.println("ClassSectionId filter: " + classSectionId);

        List<StudentDetailDTO> students = learningService.getStudentsByInstructor(user.getId(), courseId,
                classSectionId);

        System.out.println("Found " + students.size() + " students");
        System.out.println("===================================");

        return ResponseEntity.ok(students);
    }

    // New: Get classes by instructor
    @PreAuthorize("hasRole('INSTRUCTOR')")
    @GetMapping("/instructor/classes")
    public ResponseEntity<List<ClassSectionDetailDTO>> getInstructorClasses(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) UUID courseId) {

        String email = principal.getEmail();
        User user = userRepository.findByEmail(email);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        List<ClassSectionDetailDTO> classes = learningService.getClassesByInstructor(user.getId(), courseId);
        return ResponseEntity.ok(classes);
    }

    // New: Get classes for current student
    @PreAuthorize("hasRole('USER')")
    @GetMapping("/my-classes")
    public ResponseEntity<List<ClassSectionDetailDTO>> getMyClasses(
            @AuthenticationPrincipal UserPrincipal principal) {

        // principal.getId() is already the current user's id
        List<ClassSectionDetailDTO> classes = learningService.getClassesByStudent(principal.getId());
        return ResponseEntity.ok(classes);
    }
}
