package com.example.doctor.dto;

import java.time.LocalDateTime;

public class DoctorApprovalDto {
    private Long id;
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private String phone;
    private String specialization;
    private String licenseNumber;
    private String hospital;
    private String address;
    private String city;
    private String state;
    private String zipCode;
    private Integer yearsOfExperience;
    private Boolean emailVerified;
    private Boolean isVerified;
    private Long assignedAdminId;
    private String subscriptionStatus;
    private Integer patientLimit;
    private Integer currentPatients;
    private LocalDateTime registrationDate;
    private LocalDateTime emailVerificationDate;
    
    // Constructors
    public DoctorApprovalDto() {}
    
    public DoctorApprovalDto(Long id, String username, String email, String firstName, String lastName,
                           String phone, String specialization, String licenseNumber, String hospital,
                           String address, String city, String state, String zipCode, Integer yearsOfExperience,
                           Boolean emailVerified, Boolean isVerified, Long assignedAdminId, 
                           String subscriptionStatus, Integer patientLimit, Integer currentPatients,
                           LocalDateTime registrationDate, LocalDateTime emailVerificationDate) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.phone = phone;
        this.specialization = specialization;
        this.licenseNumber = licenseNumber;
        this.hospital = hospital;
        this.address = address;
        this.city = city;
        this.state = state;
        this.zipCode = zipCode;
        this.yearsOfExperience = yearsOfExperience;
        this.emailVerified = emailVerified;
        this.isVerified = isVerified;
        this.assignedAdminId = assignedAdminId;
        this.subscriptionStatus = subscriptionStatus;
        this.patientLimit = patientLimit;
        this.currentPatients = currentPatients;
        this.registrationDate = registrationDate;
        this.emailVerificationDate = emailVerificationDate;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    
    public String getSpecialization() { return specialization; }
    public void setSpecialization(String specialization) { this.specialization = specialization; }
    
    public String getLicenseNumber() { return licenseNumber; }
    public void setLicenseNumber(String licenseNumber) { this.licenseNumber = licenseNumber; }
    
    public String getHospital() { return hospital; }
    public void setHospital(String hospital) { this.hospital = hospital; }
    
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    
    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
    
    public String getState() { return state; }
    public void setState(String state) { this.state = state; }
    
    public String getZipCode() { return zipCode; }
    public void setZipCode(String zipCode) { this.zipCode = zipCode; }
    
    public Integer getYearsOfExperience() { return yearsOfExperience; }
    public void setYearsOfExperience(Integer yearsOfExperience) { this.yearsOfExperience = yearsOfExperience; }
    
    public Boolean getEmailVerified() { return emailVerified; }
    public void setEmailVerified(Boolean emailVerified) { this.emailVerified = emailVerified; }
    
    public Boolean getIsVerified() { return isVerified; }
    public void setIsVerified(Boolean isVerified) { this.isVerified = isVerified; }
    
    public Long getAssignedAdminId() { return assignedAdminId; }
    public void setAssignedAdminId(Long assignedAdminId) { this.assignedAdminId = assignedAdminId; }
    
    public String getSubscriptionStatus() { return subscriptionStatus; }
    public void setSubscriptionStatus(String subscriptionStatus) { this.subscriptionStatus = subscriptionStatus; }
    
    public Integer getPatientLimit() { return patientLimit; }
    public void setPatientLimit(Integer patientLimit) { this.patientLimit = patientLimit; }
    
    public Integer getCurrentPatients() { return currentPatients; }
    public void setCurrentPatients(Integer currentPatients) { this.currentPatients = currentPatients; }
    
    public LocalDateTime getRegistrationDate() { return registrationDate; }
    public void setRegistrationDate(LocalDateTime registrationDate) { this.registrationDate = registrationDate; }
    
    public LocalDateTime getEmailVerificationDate() { return emailVerificationDate; }
    public void setEmailVerificationDate(LocalDateTime emailVerificationDate) { this.emailVerificationDate = emailVerificationDate; }
}

