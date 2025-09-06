package com.example.admin.dto;

import java.time.LocalDateTime;

public class SchoolApprovalDto {
    private Long id;
    private String schoolName;
    private String contactPerson;
    private String email;
    private String phone;
    private String address;
    private String city;
    private String state;
    private String zipCode;
    private Integer studentCount;
    private Boolean emailVerified;
    private Boolean isVerified;
    private Long assignedAdminId;
    private String subscriptionStatus;
    private Integer childrenLimit;
    private Integer currentChildren;
    private LocalDateTime registrationDate;
    private LocalDateTime emailVerificationDate;
    
    // Constructors
    public SchoolApprovalDto() {}
    
    public SchoolApprovalDto(Long id, String schoolName, String contactPerson, String email, 
                           String phone, String address, String city, String state, String zipCode,
                           Integer studentCount, Boolean emailVerified, Boolean isVerified,
                           Long assignedAdminId, String subscriptionStatus, Integer childrenLimit,
                           Integer currentChildren, LocalDateTime registrationDate, 
                           LocalDateTime emailVerificationDate) {
        this.id = id;
        this.schoolName = schoolName;
        this.contactPerson = contactPerson;
        this.email = email;
        this.phone = phone;
        this.address = address;
        this.city = city;
        this.state = state;
        this.zipCode = zipCode;
        this.studentCount = studentCount;
        this.emailVerified = emailVerified;
        this.isVerified = isVerified;
        this.assignedAdminId = assignedAdminId;
        this.subscriptionStatus = subscriptionStatus;
        this.childrenLimit = childrenLimit;
        this.currentChildren = currentChildren;
        this.registrationDate = registrationDate;
        this.emailVerificationDate = emailVerificationDate;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getSchoolName() { return schoolName; }
    public void setSchoolName(String schoolName) { this.schoolName = schoolName; }
    
    public String getContactPerson() { return contactPerson; }
    public void setContactPerson(String contactPerson) { this.contactPerson = contactPerson; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    
    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
    
    public String getState() { return state; }
    public void setState(String state) { this.state = state; }
    
    public String getZipCode() { return zipCode; }
    public void setZipCode(String zipCode) { this.zipCode = zipCode; }
    
    public Integer getStudentCount() { return studentCount; }
    public void setStudentCount(Integer studentCount) { this.studentCount = studentCount; }
    
    public Boolean getEmailVerified() { return emailVerified; }
    public void setEmailVerified(Boolean emailVerified) { this.emailVerified = emailVerified; }
    
    public Boolean getIsVerified() { return isVerified; }
    public void setIsVerified(Boolean isVerified) { this.isVerified = isVerified; }
    
    public Long getAssignedAdminId() { return assignedAdminId; }
    public void setAssignedAdminId(Long assignedAdminId) { this.assignedAdminId = assignedAdminId; }
    
    public String getSubscriptionStatus() { return subscriptionStatus; }
    public void setSubscriptionStatus(String subscriptionStatus) { this.subscriptionStatus = subscriptionStatus; }
    
    public Integer getChildrenLimit() { return childrenLimit; }
    public void setChildrenLimit(Integer childrenLimit) { this.childrenLimit = childrenLimit; }
    
    public Integer getCurrentChildren() { return currentChildren; }
    public void setCurrentChildren(Integer currentChildren) { this.currentChildren = currentChildren; }
    
    public LocalDateTime getRegistrationDate() { return registrationDate; }
    public void setRegistrationDate(LocalDateTime registrationDate) { this.registrationDate = registrationDate; }
    
    public LocalDateTime getEmailVerificationDate() { return emailVerificationDate; }
    public void setEmailVerificationDate(LocalDateTime emailVerificationDate) { this.emailVerificationDate = emailVerificationDate; }
}
