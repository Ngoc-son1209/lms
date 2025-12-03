package com.lms.dev.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.lms.dev.entity.Course;
import com.lms.dev.security.UserPrincipal;
import com.lms.dev.service.CourseService;

@RestController
@RequestMapping("/api/courses")
public class CourseController {

    @Autowired
    private CourseService courseService;

    @GetMapping
    public List<Course> getAllCourses() {
        return courseService.getAllCourses();
    }

    @PreAuthorize("hasRole('INSTRUCTOR')")
    @GetMapping("/my")
    public List<Course> getMyCourses(@AuthenticationPrincipal UserPrincipal principal) {
        return courseService.getCoursesByInstructor(principal.getId());
    }

    @GetMapping("/{id}")
    public Course getCourseById(@PathVariable UUID id) {
        return courseService.getCourseById(id);
    }

    @PreAuthorize("hasAnyRole('ADMIN','INSTRUCTOR')")
    @PostMapping
    public Course createCourse(@RequestBody Course course, @AuthenticationPrincipal UserPrincipal principal) {
        // If current user is instructor, force-link instructorId to current user
        if (principal.getAuthorities().stream().anyMatch(a -> "ROLE_INSTRUCTOR".equals(a.getAuthority()))) {
            course.setInstructorId(principal.getId());
        }
        return courseService.createCourse(course);
    }

    @PreAuthorize("hasAnyRole('ADMIN','INSTRUCTOR')")
    @PutMapping("/{id}")
    public ResponseEntity<Course> updateCourse(@PathVariable UUID id, @RequestBody Course updatedCourse,
            @AuthenticationPrincipal UserPrincipal principal) {
        // If instructor, enforce ownership
        boolean isInstructor = principal.getAuthorities().stream()
                .anyMatch(a -> "ROLE_INSTRUCTOR".equals(a.getAuthority()));
        if (isInstructor) {
            Course existing = courseService.getCourseById(id);
            if (existing == null)
                return ResponseEntity.notFound().build();
            if (existing.getInstructorId() == null || !existing.getInstructorId().equals(principal.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            // keep instructorId bound to owner
            updatedCourse.setInstructorId(principal.getId());
        }
        Course saved = courseService.updateCourse(id, updatedCourse);
        return saved != null ? ResponseEntity.ok(saved) : ResponseEntity.notFound().build();
    }

    @PreAuthorize("hasAnyRole('ADMIN','INSTRUCTOR')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCourse(@PathVariable UUID id, @AuthenticationPrincipal UserPrincipal principal) {
        boolean isInstructor = principal.getAuthorities().stream()
                .anyMatch(a -> "ROLE_INSTRUCTOR".equals(a.getAuthority()));
        if (isInstructor) {
            Course existing = courseService.getCourseById(id);
            if (existing == null)
                return ResponseEntity.notFound().build();
            if (existing.getInstructorId() == null || !existing.getInstructorId().equals(principal.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
        }
        courseService.deleteCourse(id);
        return ResponseEntity.noContent().build();
    }
}