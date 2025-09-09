package com.example.parent.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SchoolInfoDto {
    private Long id;
    private String schoolName;
    private String email;
    private String contactPerson;
    private String phone;
    private String address;
    private String city;
    private String state;
    private String zipCode;
    private Integer studentCount;
    private String subscriptionStatus;
    private Integer childrenLimit;
    private Integer currentChildren;
    private String website;
    private String description;
    private Integer establishedYear;
    private String principalName;
}
