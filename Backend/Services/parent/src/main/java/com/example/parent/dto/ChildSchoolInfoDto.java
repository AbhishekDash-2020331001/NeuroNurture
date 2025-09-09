package com.example.parent.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChildSchoolInfoDto {
    private Long childId;
    private String childName;
    private String grade;
    private Long schoolId;
    private SchoolInfoDto school;
    private String enrollmentDate;
    private String status;
}
