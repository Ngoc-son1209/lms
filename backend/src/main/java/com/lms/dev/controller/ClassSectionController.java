package com.lms.dev.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.lms.dev.dto.ClassSectionRequest;
import com.lms.dev.dto.ClassWithCountDTO;
import com.lms.dev.service.ClassSectionService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/classes")
@RequiredArgsConstructor
public class ClassSectionController {

    private final ClassSectionService classService;

    @GetMapping("/by-course/{courseId}")
    public ResponseEntity<List<ClassWithCountDTO>> getByCourse(@PathVariable UUID courseId) {
        return ResponseEntity.ok(classService.getByCourse(courseId));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<?> create(@RequestBody ClassSectionRequest req) {
        try {
            return ResponseEntity.ok(classService.create(req));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        } catch (Exception ex) {
            return ResponseEntity.status(500).body("Failed to create class section");
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable UUID id, @RequestBody ClassSectionRequest req) {
        try {
            return ResponseEntity.ok(classService.update(id, req));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        } catch (Exception ex) {
            return ResponseEntity.status(500).body("Failed to update class section");
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        classService.delete(id);
        return ResponseEntity.noContent().build();
    }
}

