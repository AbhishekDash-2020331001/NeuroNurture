package com.example.school.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.school.entity.SchoolTask;

@Repository
public interface SchoolTaskRepository extends JpaRepository<SchoolTask, Long> {
    
    // Find all tasks for a specific school
    List<SchoolTask> findBySchoolId(Long schoolId);
    
    // Find all tasks for a specific child
    List<SchoolTask> findByChildId(Long childId);
    
    // Find tasks by school and child
    List<SchoolTask> findBySchoolIdAndChildId(Long schoolId, Long childId);
    
    // Find tasks by status
    List<SchoolTask> findBySchoolIdAndStatus(Long schoolId, String status);
    
    // Find tasks by child and status
    List<SchoolTask> findByChildIdAndStatus(Long childId, String status);
    
    // Find tasks by task_id
    List<SchoolTask> findByTaskId(Long taskId);
    
    // Find tasks by school and task_id
    List<SchoolTask> findBySchoolIdAndTaskId(Long schoolId, Long taskId);
    
    // Delete all tasks by task_id
    void deleteByTaskId(Long taskId);
    
    // Note: Bit-mapped game queries are handled in the service layer
    // since HQL doesn't support bitwise operations directly
}
