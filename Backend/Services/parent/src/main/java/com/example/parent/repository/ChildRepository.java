package com.example.parent.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.parent.entity.Child;

public interface ChildRepository extends JpaRepository<Child, Long> {
    List<Child> findByParentId(Long parentId);
    List<Child> findBySchoolId(Long schoolId);
    List<Child> findByDoctorId(Long doctorId);
} 