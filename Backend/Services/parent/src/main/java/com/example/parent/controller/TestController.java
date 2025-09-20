package com.example.parent.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/test")
public class TestController {
    
    @Autowired
    private MongoTemplate mongoTemplate;
    
    @GetMapping("/mongodb")
    public String testMongoDB() {
        try {
            // Test MongoDB connection
            mongoTemplate.getCollectionNames();
            return "MongoDB connection successful!";
        } catch (Exception e) {
            return "MongoDB connection failed: " + e.getMessage();
        }
    }
}
