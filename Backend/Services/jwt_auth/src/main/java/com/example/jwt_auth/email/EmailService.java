package com.example.jwt_auth.email;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    
    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);
    
    @Autowired(required = false)
    private JavaMailSender mailSender;
    
    public void sendVerificationEmail(String to, String username, String verificationToken) {
        try {
            if (mailSender != null) {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setFrom("tarekahmad484@gmail.com"); // Use your verified sender email
                message.setTo(to);
                message.setSubject("Verify your email - NeuroNurture");
                message.setText(
                    "Hello " + username + ",\n\n" +
                    "Thank you for registering with NeuroNurture! Please verify your email address by clicking the link below:\n\n" +
                    "http://localhost:8081/verify-email?token=" + verificationToken + "\n\n" +
                    "This link will expire in 24 hours.\n\n" +
                    "If you didn't create an account, please ignore this email.\n\n" +
                    "Best regards,\n" +
                    "The NeuroNurture Team"
                );
                
                mailSender.send(message);
                logger.info("Verification email sent to: {}", to);
            } else {
                // Fallback: log the verification token for development
                logger.warn("Email service not configured. Verification token for {}: {}", to, verificationToken);
                logger.info("For development, use this verification link: http://localhost:8081/verify-email?token={}", verificationToken);
            }
        } catch (Exception e) {
            logger.error("Failed to send verification email to: {}", to, e);
            // Don't throw exception - just log it
            logger.warn("Verification token for {}: {}", to, verificationToken);
        }
    }
    
    public void sendPasswordResetEmail(String to, String username, String resetToken) {
        try {
            if (mailSender != null) {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setFrom("tarekahmad484@gmail.com"); // Use your verified sender email
                message.setTo(to);
                message.setSubject("Reset your password - NeuroNurture");
                message.setText(
                    "Hello " + username + ",\n\n" +
                    "You requested to reset your password. Please click the link below to reset it:\n\n" +
                    "http://localhost:8081/reset-password?token=" + resetToken + "\n\n" +
                    "This link will expire in 1 hour.\n\n" +
                    "If you didn't request a password reset, please ignore this email.\n\n" +
                    "Best regards,\n" +
                    "The NeuroNurture Team"
                );
                
                mailSender.send(message);
                logger.info("Password reset email sent to: {}", to);
            } else {
                logger.warn("Email service not configured. Password reset token for {}: {}", to, resetToken);
            }
        } catch (Exception e) {
            logger.error("Failed to send password reset email to: {}", to, e);
        }
    }
} 