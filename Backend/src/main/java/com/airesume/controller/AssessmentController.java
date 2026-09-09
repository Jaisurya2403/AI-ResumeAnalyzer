package com.airesume.controller;

import com.airesume.model.AssessmentSubmissionDto;
import com.airesume.model.Candidate;
import com.airesume.service.AssessmentEvaluationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/assessment")
@CrossOrigin(origins = "*")
public class AssessmentController {

    @Autowired
    private AssessmentEvaluationService assessmentEvaluationService;

    @GetMapping("/{token}")
    public ResponseEntity<?> getCandidateAssessmentContext(@PathVariable String token) {
        Optional<Candidate> opt = assessmentEvaluationService.getCandidateByToken(token);
        if (opt.isEmpty()) {
            Map<String, String> err = new HashMap<>();
            err.put("status", "NOT_FOUND");
            err.put("message", "Invalid or expired assessment link token.");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(err);
        }

        Candidate c = opt.get();

        if (c.getExpiryDate() != null && java.time.LocalDateTime.now().isAfter(c.getExpiryDate())) {
            Map<String, Object> expired = new HashMap<>();
            expired.put("status", "EXPIRED");
            expired.put("isExpired", true);
            expired.put("message", "This assessment invitation has expired.");
            expired.put("expiryDate", c.getExpiryDate().toString());
            expired.put("companyName", c.getCompanyName());
            expired.put("targetRole", c.getTargetRole());
            return ResponseEntity.status(HttpStatus.GONE).body(expired);
        }

        Map<String, Object> resp = new HashMap<>();
        resp.put("candidateId", c.getId());
        resp.put("name", c.getName());
        resp.put("email", c.getEmail());
        resp.put("targetRole", c.getTargetRole());
        resp.put("companyName", c.getCompanyName());
        resp.put("expiryDate", c.getExpiryDate() != null ? c.getExpiryDate().toString() : null);
        resp.put("skills", c.getSkills());
        resp.put("status", c.getStatus().name());
        resp.put("alreadyCompleted", c.getStatus() == com.airesume.model.CandidateStatus.COMPLETED);
        resp.put("isDisqualified", c.getStatus() == com.airesume.model.CandidateStatus.DISQUALIFIED);
        resp.put("completedAt", c.getCompletedAt() != null ? c.getCompletedAt().toString() : null);

        return ResponseEntity.ok(resp);
    }

    @PostMapping("/{token}/submit")
    public ResponseEntity<?> submitAssessmentAnswers(
            @PathVariable String token,
            @RequestBody AssessmentSubmissionDto submission
    ) {
        Optional<Candidate> opt = assessmentEvaluationService.getCandidateByToken(token);
        if (opt.isPresent()) {
            Candidate c = opt.get();
            if (c.getStatus() == com.airesume.model.CandidateStatus.COMPLETED || c.getStatus() == com.airesume.model.CandidateStatus.DISQUALIFIED) {
                Map<String, String> err = new HashMap<>();
                err.put("status", c.getStatus().name());
                err.put("message", "This assessment has already been finalized and cannot be retaken.");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(err);
            }
            if (c.getExpiryDate() != null && java.time.LocalDateTime.now().isAfter(c.getExpiryDate())) {
                Map<String, String> err = new HashMap<>();
                err.put("status", "EXPIRED");
                err.put("message", "Assessment deadline has passed. Submission rejected.");
                return ResponseEntity.status(HttpStatus.GONE).body(err);
            }
        }

        boolean success = assessmentEvaluationService.submitAssessment(token, submission);
        if (!success) {
            Map<String, String> err = new HashMap<>();
            err.put("status", "ERROR");
            err.put("message", "Unable to submit assessment. Invalid token.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(err);
        }

        // Return clean acknowledgement WITHOUT revealing scores to candidate
        Map<String, Object> resp = new HashMap<>();
        resp.put("status", "SUCCESS");
        resp.put("message", "Assessment submitted successfully! Your evaluation is now complete and being processed by the hiring team.");
        resp.put("completed", true);

        return ResponseEntity.ok(resp);
    }
}
