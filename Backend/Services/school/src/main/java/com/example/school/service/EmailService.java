package com.example.school.service;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.sendgrid.Method;
import com.sendgrid.Request;
import com.sendgrid.Response;
import com.sendgrid.SendGrid;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Content;
import com.sendgrid.helpers.mail.objects.Email;

@Service
public class EmailService {
    
    @Value("${sendgrid.api-key}")
    private String sendGridApiKey;
    
    @Value("${sendgrid.from-email}")
    private String fromEmail;
    
    @Value("${sendgrid.from-name}")
    private String fromName;
    
    public void sendVerificationEmail(String toEmail, String schoolName, String verificationToken) {
        try {
            SendGrid sg = new SendGrid(sendGridApiKey);
            
            Email from = new Email(fromEmail, fromName);
            String subject = "Verify Your School Account - NeuroNurture";
            Email to = new Email(toEmail);
            
            String verificationUrl = "http://localhost:8081/school/verify-email?token=" + verificationToken;
            
            String htmlContent = buildVerificationEmailHtml(schoolName, verificationUrl);
            Content content = new Content("text/html", htmlContent);
            
            Mail mail = new Mail(from, subject, to, content);
            
            Request request = new Request();
            request.setMethod(Method.POST);
            request.setEndpoint("mail/send");
            request.setBody(mail.build());
            
            Response response = sg.api(request);
            System.out.println("Email sent with status: " + response.getStatusCode());
            
        } catch (IOException ex) {
            System.err.println("Error sending email: " + ex.getMessage());
            throw new RuntimeException("Failed to send verification email", ex);
        }
    }
    
    private String buildVerificationEmailHtml(String schoolName, String verificationUrl) {
        return "<!DOCTYPE html>" +
            "<html>" +
            "<head>" +
                "<meta charset=\"utf-8\">" +
                "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">" +
                "<title>Verify Your School Account</title>" +
                "<style>" +
                    "body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }" +
                    ".container { max-width: 600px; margin: 0 auto; padding: 20px; }" +
                    ".header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }" +
                    ".content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }" +
                    ".button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }" +
                    ".button:hover { background: #5a6fd8; }" +
                    ".footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }" +
                "</style>" +
            "</head>" +
            "<body>" +
                "<div class=\"container\">" +
                    "<div class=\"header\">" +
                        "<h1>Welcome to NeuroNurture!</h1>" +
                        "<p>Your School Account Verification</p>" +
                    "</div>" +
                    "<div class=\"content\">" +
                        "<h2>Hello " + schoolName + "!</h2>" +
                        "<p>Thank you for registering your school with NeuroNurture. We're excited to help you track and improve your students' cognitive development.</p>" +
                        
                        "<p>To complete your registration and access your school dashboard, please verify your email address by clicking the button below:</p>" +
                        
                        "<div style=\"text-align: center;\">" +
                            "<a href=\"" + verificationUrl + "\" class=\"button\">Verify Email Address</a>" +
                        "</div>" +
                        
                        "<p>If the button doesn't work, you can also copy and paste this link into your browser:</p>" +
                        "<p style=\"word-break: break-all; background: #e9e9e9; padding: 10px; border-radius: 5px;\">" + verificationUrl + "</p>" +
                        
                        "<p><strong>What happens next?</strong></p>" +
                        "<ul>" +
                            "<li>After email verification, your school will be reviewed by our administration team</li>" +
                            "<li>Once approved, you'll have full access to all NeuroNurture features</li>" +
                            "<li>You'll be able to enroll students, track progress, and manage competitions</li>" +
                        "</ul>" +
                        
                        "<p>This verification link will expire in 24 hours for security reasons.</p>" +
                    "</div>" +
                    "<div class=\"footer\">" +
                        "<p>If you didn't create this account, please ignore this email.</p>" +
                        "<p>&copy; 2024 NeuroNurture. All rights reserved.</p>" +
                    "</div>" +
                "</div>" +
            "</body>" +
            "</html>";
    }
}
