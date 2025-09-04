package com.example.admin;

import java.util.Arrays;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class AdminService {
    
    @Autowired
    private RestTemplate restTemplate;
    
    private static final String PARENT_SERVICE_URL = "http://localhost:8082";
    
    public List<ParentWithChildrenDto> getAllParentsWithChildren() {
        try {
            // First, get all parents
            ParentWithChildrenDto[] parents = restTemplate.getForObject(
                PARENT_SERVICE_URL + "/api/parents", 
                ParentWithChildrenDto[].class
            );
            
            if (parents == null) {
                return Arrays.asList();
            }
            
            // For each parent, fetch their children
            for (ParentWithChildrenDto parent : parents) {
                try {
                    ParentWithChildrenDto.ChildDto[] children = restTemplate.getForObject(
                        PARENT_SERVICE_URL + "/api/parents/" + parent.getId() + "/children",
                        ParentWithChildrenDto.ChildDto[].class
                    );
                    parent.setChildren(children != null ? Arrays.asList(children) : Arrays.asList());
                } catch (Exception e) {
                    // If children fetch fails, set empty list
                    parent.setChildren(Arrays.asList());
                }
            }
            
            return Arrays.asList(parents);
        } catch (Exception e) {
            // Return empty list if parent service is not available
            return Arrays.asList();
        }
    }
    
    public ParentWithChildrenDto getParentById(Long parentId) {
        try {
            ParentWithChildrenDto parent = restTemplate.getForObject(
                PARENT_SERVICE_URL + "/api/parents/" + parentId,
                ParentWithChildrenDto.class
            );
            
            if (parent != null) {
                // Fetch children for this parent
                try {
                    ParentWithChildrenDto.ChildDto[] children = restTemplate.getForObject(
                        PARENT_SERVICE_URL + "/api/parents/" + parentId + "/children",
                        ParentWithChildrenDto.ChildDto[].class
                    );
                    parent.setChildren(children != null ? Arrays.asList(children) : Arrays.asList());
                } catch (Exception e) {
                    parent.setChildren(Arrays.asList());
                }
            }
            
            return parent;
        } catch (Exception e) {
            return null;
        }
    }
    
    public ParentWithChildrenDto updateParentStatus(Long parentId, String status) {
        try {
            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.setContentType(org.springframework.http.MediaType.TEXT_PLAIN);
            org.springframework.http.HttpEntity<String> entity = new org.springframework.http.HttpEntity<>(status, headers);
            
            restTemplate.exchange(
                PARENT_SERVICE_URL + "/api/parents/" + parentId + "/status",
                org.springframework.http.HttpMethod.PUT,
                entity,
                String.class
            );
            // After updating, fetch the updated parent data
            return getParentById(parentId);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
}
