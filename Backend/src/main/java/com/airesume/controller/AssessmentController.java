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
        Map<String, Object> resp = new HashMap<>();
        resp.put("candidateId", c.getId());
        resp.put("name", c.getName());
        resp.put("email", c.getEmail());
        resp.put("targetRole", c.getTargetRole());
        resp.put("skills", c.getSkills());
        resp.put("status", c.getStatus().name());
        resp.put("alreadyCompleted", c.getStatus().name().equals("COMPLETED"));

        return ResponseEntity.ok(resp);
    }

    @PostMapping("/{token}/submit")
    public ResponseEntity<?> submitAssessmentAnswers(
            @PathVariable String token,
            @RequestBody AssessmentSubmissionDto submission
    ) {
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
