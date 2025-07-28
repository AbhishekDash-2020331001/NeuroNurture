package com.example.parent;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/parents")
public class ParentController {
    @Autowired private ParentRepository parentRepository;
    @Autowired private ChildRepository childRepository;

    // Get parent by email
    @GetMapping("/by-email/{email}")
    public ResponseEntity<Parent> getParentByEmail(@PathVariable String email) {
        return parentRepository.findByEmail(email)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Get parent by ID
    @GetMapping("/{parentId}")
    public ResponseEntity<Parent> getParentById(@PathVariable Long parentId) {
        return parentRepository.findById(parentId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Create or update parent info
    @PostMapping
    public ResponseEntity<Parent> createOrUpdateParent(@RequestBody Parent parent) {
        Optional<Parent> existing = parentRepository.findByEmail(parent.getEmail());
        if (existing.isPresent()) {
            Parent p = existing.get();
            p.setName(parent.getName());
            p.setAddress(parent.getAddress());
            p.setNumberOfChildren(parent.getNumberOfChildren());
            p.setSuspectedAutisticChildCount(parent.getSuspectedAutisticChildCount());
            return ResponseEntity.ok(parentRepository.save(p));
        } else {
            return ResponseEntity.ok(parentRepository.save(parent));
        }
    }

    // Update parent info by ID
    @PutMapping("/{parentId}")
    public ResponseEntity<Parent> updateParent(@PathVariable Long parentId, @RequestBody Parent parent) {
        return parentRepository.findById(parentId)
                .map(existingParent -> {
                    // Only allow updating specific fields
                    existingParent.setAddress(parent.getAddress());
                    existingParent.setNumberOfChildren(parent.getNumberOfChildren());
                    existingParent.setSuspectedAutisticChildCount(parent.getSuspectedAutisticChildCount());
                    return ResponseEntity.ok(parentRepository.save(existingParent));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // Get all children for a parent
    @GetMapping("/{parentId}/children")
    public ResponseEntity<List<Child>> getChildren(@PathVariable Long parentId) {
        return ResponseEntity.ok(childRepository.findByParentId(parentId));
    }

    // Add a new child to a parent
    @PostMapping("/{parentId}/children")
    public ResponseEntity<Child> addChild(@PathVariable Long parentId, @RequestBody Child child) {
        Parent parent = parentRepository.findById(parentId)
                .orElseThrow(() -> new RuntimeException("Parent not found"));
        child.setParent(parent);
        return ResponseEntity.ok(childRepository.save(child));
    }

    // Get a specific child by id
    @GetMapping("/children/{childId}")
    public ResponseEntity<Child> getChild(@PathVariable Long childId) {
        return childRepository.findById(childId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Delete a specific child by id
    @DeleteMapping("/children/{childId}")
    public ResponseEntity<Void> deleteChild(@PathVariable Long childId) {
        if (!childRepository.existsById(childId)) {
            return ResponseEntity.notFound().build();
        }
        childRepository.deleteById(childId);
        return ResponseEntity.noContent().build();
    }
} 