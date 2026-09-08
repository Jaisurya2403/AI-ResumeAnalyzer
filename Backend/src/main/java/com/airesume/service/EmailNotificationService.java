package com.airesume.service;

import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailNotificationService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:alonewarrior123456@gmail.com}")
    private String senderEmail;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    public boolean sendAssessmentInvitation(String recipientEmail, String candidateName, String targetRole, String token) {
        if (recipientEmail == null || recipientEmail.isBlank()) {
            System.err.println("Cannot send email: recipient email is empty.");
            return false;
        }

        String assessmentLink = frontendUrl + "/assessment/" + token;

        try {
            if (mailSender == null) {
                System.out.println("JavaMailSender not initialized, assessment link: " + assessmentLink);
                return true;
            }

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(senderEmail, "EVAL AI Talent Recruitment");
            helper.setTo(recipientEmail);
            helper.setSubject("Invitation to AI Technical Assessment for " + targetRole + " — EVAL AI");

            String htmlBody = buildLuxuryEmailTemplate(candidateName, targetRole, assessmentLink);
            helper.setText(htmlBody, true);

            mailSender.send(message);
            System.out.println("Successfully dispatched assessment invite email to: " + recipientEmail);
            return true;
        } catch (Exception e) {
            System.err.println("Failed to send assessment email to " + recipientEmail + ": " + e.getMessage());
            // Log assessment link so user/recruiter can also test locally
            System.out.println("Direct Assessment Link for candidate (" + candidateName + "): " + assessmentLink);
            return false;
        }
    }

    private String buildLuxuryEmailTemplate(String name, String role, String link) {
        return "<!DOCTYPE html>"
                + "<html>"
                + "<head>"
                + "<meta charset='utf-8'>"
                + "<style>"
                + "body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #07080c; color: #ffffff; margin: 0; padding: 20px; }"
                + ".container { max-width: 600px; margin: 0 auto; background: #0e111a; border: 1px solid #d4af37; border-radius: 12px; padding: 35px; box-shadow: 0 10px 30px rgba(0,0,0,0.8); }"
                + ".logo { color: #d4af37; font-size: 22px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 20px; text-align: center; }"
                + ".title { font-size: 20px; color: #ffffff; margin-bottom: 12px; font-weight: 600; }"
                + ".role-badge { display: inline-block; background: rgba(212,175,55,0.15); color: #f5df88; border: 1px solid rgba(212,175,55,0.4); padding: 5px 12px; border-radius: 20px; font-size: 13px; margin-bottom: 20px; }"
                + ".content { font-size: 15px; line-height: 1.6; color: #cbd5e1; margin-bottom: 25px; }"
                + ".btn { display: block; width: 240px; margin: 25px auto; text-align: center; background: linear-gradient(135deg, #d4af37 0%, #aa820a 100%); color: #07080c !important; text-decoration: none; padding: 14px 24px; border-radius: 8px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 15px rgba(212,175,55,0.4); }"
                + ".rounds-box { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 15px; margin-bottom: 20px; font-size: 13px; color: #94a3b8; }"
                + ".footer { text-align: center; font-size: 12px; color: #64748b; margin-top: 30px; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 20px; }"
                + "</style>"
                + "</head>"
                + "<body>"
                + "<div class='container'>"
                + "<div class='logo'>◆ EVAL AI ASSESSMENT ◆</div>"
                + "<div class='title'>Dear " + (name != null ? name : "Candidate") + ",</div>"
                + "<div class='role-badge'>" + role + "</div>"
                + "<div class='content'>"
                + "Your resume has been successfully reviewed by our hiring panel. We are pleased to invite you to complete the next stage: a <strong>simulated 4-round AI Technical & Behavioral Assessment</strong>."
                + "</div>"
                + "<div class='rounds-box'>"
                + "<strong>Assessment Overview:</strong><br>"
                + "• Round 1: Aptitude & Verbal Reasoning<br>"
                + "• Round 2: Role-Specific Domain MCQs<br>"
                + "• Round 3: Adaptive Practical Scenario Challenge<br>"
                + "• Round 4: Live Voice Communication & Behavioral Round"
                + "</div>"
                + "<a href='" + link + "' class='btn' target='_blank'>Start Assessment Now</a>"
                + "<div class='content' style='font-size: 13px; color: #94a3b8; text-align: center;'>"
                + "Or copy this link to your browser:<br>"
                + "<span style='color: #d4af37; word-break: break-all;'>" + link + "</span>"
                + "</div>"
                + "<div class='footer'>"
                + "EVAL AI Automated Hiring Pipeline • Please do not reply directly to this email."
                + "</div>"
                + "</div>"
                + "</body>"
                + "</html>";
    }
}
