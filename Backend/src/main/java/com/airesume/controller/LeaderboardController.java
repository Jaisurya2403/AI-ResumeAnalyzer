package com.airesume.controller;

import com.airesume.model.Candidate;
import com.airesume.model.LeaderboardEntryDto;
import com.airesume.repository.CandidateRepository;
import com.airesume.service.LeaderboardPdfService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/leaderboard")
@CrossOrigin(origins = "*")
public class LeaderboardController {

    @Autowired
    private CandidateRepository candidateRepository;

    @Autowired
    private LeaderboardPdfService leaderboardPdfService;

    @GetMapping
    public ResponseEntity<List<LeaderboardEntryDto>> getLeaderboard() {
        List<Candidate> list = candidateRepository.findAllOrderByOverallScoreDesc();
        List<LeaderboardEntryDto> leaderboard = new ArrayList<>();

        int rank = 1;
        for (Candidate c : list) {
            double resScore = c.getResumeScore() != null ? c.getResumeScore() : 0.0;
            double assessScore = c.getAssessmentScore() != null ? c.getAssessmentScore() : 0.0;
            double overall = c.getOverallScore() != null ? c.getOverallScore() : resScore;

            LeaderboardEntryDto entry = LeaderboardEntryDto.builder()
                    .rank(rank++)
                    .candidateId(c.getId())
                    .name(c.getName())
                    .email(c.getEmail())
                    .targetRole(c.getTargetRole())
                    .resumeScore(resScore)
                    .assessmentScore(c.getAssessmentScore() != null ? assessScore : null)
                    .overallScore(overall)
                    .status(c.getStatus().name())
                    .resumeViewUrl("/api/resumes/" + c.getId() + "/pdf")
                    .createdAt(c.getCreatedAt())
                    .completedAt(c.getCompletedAt())
                    .build();

            leaderboard.add(entry);
        }

        return ResponseEntity.ok(leaderboard);
    }

    @GetMapping("/export-pdf")
    public ResponseEntity<byte[]> exportLeaderboardPdf() {
        try {
            byte[] pdf = leaderboardPdfService.generateLeaderboardPdf();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "EVAL_AI_Leaderboard.pdf");

            return new ResponseEntity<>(pdf, headers, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error generating Leaderboard PDF: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
