package com.airesume.service;

import com.airesume.model.AssessmentSubmissionDto;
import com.airesume.model.Candidate;
import com.airesume.model.CandidateStatus;
import com.airesume.repository.CandidateRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

@Service
public class AssessmentEvaluationService {

    @Autowired
    private CandidateRepository candidateRepository;

    @Autowired
    private AiScoringService aiScoringService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public Optional<Candidate> getCandidateByToken(String token) {
        return candidateRepository.findByToken(token);
    }

    public boolean submitAssessment(String token, AssessmentSubmissionDto submission) {
        Optional<Candidate> optCandidate = candidateRepository.findByToken(token);
        if (optCandidate.isEmpty()) {
            return false;
        }

        Candidate candidate = optCandidate.get();

        // Compute Assessment Score from rounds
        double r1 = 0.0, r2 = 0.0, r3 = 0.0, r4 = 0.0;
        if (submission.getRoundScores() != null) {
            Map<String, Integer> scores = submission.getRoundScores();
            if (scores.containsKey("round1") && scores.get("round1") != null) r1 = scores.get("round1");
            if (scores.containsKey("round2") && scores.get("round2") != null) r2 = scores.get("round2");
            if (scores.containsKey("round3") && scores.get("round3") != null) r3 = scores.get("round3");
            if (scores.containsKey("round4") && scores.get("round4") != null) r4 = scores.get("round4");
        }

        boolean isViolation = Boolean.TRUE.equals(submission.getViolation());

        // Compute Assessment Score from rounds (or 0.0 if disqualified)
        double assessmentScore = isViolation ? 0.0 : (Math.round(((r1 * 0.15) + (r2 * 0.35) + (r3 * 0.30) + (r4 * 0.20)) * 10.0) / 10.0);
        double overallScore = isViolation ? 0.0 : aiScoringService.calculateOverallScore(candidate.getResumeScore(), assessmentScore);

        try {
            if (submission.getRoundScores() != null) {
                candidate.setRoundScoresJson(objectMapper.writeValueAsString(submission.getRoundScores()));
            } else {
                candidate.setRoundScoresJson(objectMapper.writeValueAsString(submission));
            }
        } catch (Exception e) {
            candidate.setRoundScoresJson("{}");
        }

        candidate.setAssessmentScore(assessmentScore);
        candidate.setOverallScore(overallScore);
        candidate.setStatus(isViolation ? CandidateStatus.DISQUALIFIED : CandidateStatus.COMPLETED);
        candidate.setCompletedAt(LocalDateTime.now());

        candidateRepository.save(candidate);
        return true;
    }
}
