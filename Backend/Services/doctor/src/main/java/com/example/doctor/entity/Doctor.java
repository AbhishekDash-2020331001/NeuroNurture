package com.example.doctor.entity;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.Collections;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "doctors")
@EntityListeners(AuditingEntityListener.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Doctor implements UserDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    @Column(nullable = false)
    private String phone;

    @Column(nullable = false)
    private String specialization;

    @Column(nullable = false)
    private String licenseNumber;

    @Column(nullable = false)
    private String hospital;

    @Column(nullable = false)
    private String address;

    @Column(nullable = false)
    private String city;

    @Column(nullable = false)
    private String state;

    @Column(nullable = false)
    private String zipCode;

    @Column(nullable = false)
    private Integer yearsOfExperience;

    @Column(nullable = false)
    private String role = "DOCTOR";

    @Column(nullable = false)
    private Boolean enabled = true;

    @Column(nullable = false)
    private Boolean emailVerified = false;

    @Column
    private String verificationToken;

    @Column
    private java.time.LocalDateTime verificationTokenExpiry;

    @Column(nullable = false)
    private Boolean isVerified = false; // Admin approval status

    @Column(name = "status")
    private String status = "active"; // Default to "active", can be "active" or "suspended"

    @Column
    private LocalDateTime subscriptionExpiry; // When subscription expires, null means no active subscription

    @Column
    private String stripeCustomerId; // Stripe customer ID for subscription management

    @Column
    private String stripeSubscriptionId; // Stripe subscription ID

    @Column
    private Integer patientLimit = 50; // Default limit before requiring subscription

    @Column
    private Integer currentPatients = 0;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    // UserDetails implementation
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role));
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return enabled;
    }

    // Helper method to check if subscription is active
    public boolean isSubscriptionActive() {
        return subscriptionExpiry != null && subscriptionExpiry.isAfter(LocalDateTime.now());
    }

    // Helper method to get subscription status
    public String getSubscriptionStatus() {
        if (subscriptionExpiry == null) {
            return "none";
        } else if (subscriptionExpiry.isAfter(LocalDateTime.now())) {
            return "active";
        } else {
            return "expired";
        }
    }
}

