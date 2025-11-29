package com.lms.dev.repository;

import com.lms.dev.entity.Course;
import com.lms.dev.entity.Instructor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CourseRepository extends JpaRepository<Course, UUID> {
    
    

    

    // Tìm kiếm các khóa học theo category/expertise
    List<Course> findByCategory(String category);

    
}