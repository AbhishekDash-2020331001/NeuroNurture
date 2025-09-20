package com.example.admin.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ParentWithChildrenDto {
    private Long id;
    private String name;
    private String email;
    private String address;
    private Integer numberOfChildren;
    private Integer suspectedAutisticChildCount;
    private String status;
    private List<ChildDto> children;
    
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChildDto {
        private Long id;
        private String name;
        private String gender;
        private String dateOfBirth;
        private Double height;
        private Double weight;
    }
}
