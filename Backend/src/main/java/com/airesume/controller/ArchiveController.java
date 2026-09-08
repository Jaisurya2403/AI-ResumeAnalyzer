package com.airesume.controller;

import com.airesume.model.Candidate;
import com.airesume.model.LeaderboardEntryDto;
import com.airesume.repository.CandidateRepository;
import com.airesume.service.AuthService;
import com.airesume.service.CompanyService;
import com.airesume.service.LeaderboardPdfService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.*;

@RestController
@RequestMapping("/api/archive")
@CrossOrigin(origins = "*")
public class ArchiveController {

    @Autowired
    private CompanyService companyService;

    @Autowired
    private CandidateRepository candidateRepository;

    @Autowired
    private LeaderboardPdfService leaderboardPdfService;

    @Autowired
    private AuthService authService;

    @GetMapping("/my-history")
    public ResponseEntity<?> getMyCandidateHistory(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestParam(value = "email", required = false) String emailParam
    ) {
        String userEmail = null;
        if (authHeader != null && !authHeader.isBlank()) {
            Optional<com.airesume.model.User> optUser = authService.getUserFromToken(authHeader);
            if (optUser.isPresent()) {
                userEmail = optUser.get().getEmail();
            }
        }
        if ((userEmail == null || userEmail.isBlank()) && emailParam != null && !emailParam.isBlank()) {
            userEmail = emailParam.trim();
        }

        if (userEmail == null || userEmail.isBlank()) {
            Map<String, Object> err = new HashMap<>();
            err.put("authenticated", false);
            err.put("message", "Please sign in to view your personal archive.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(err);
        }

        List<Candidate> candidates = candidateRepository.findByEmailIgnoreCaseOrderByCreatedAtDesc(userEmail);

        List<LeaderboardEntryDto> dtos = new ArrayList<>();
        int rank = 1;
        for (Candidate c : candidates) {
            double resScore = c.getResumeScore() != null ? c.getResumeScore() : 0.0;
            Double assessScore = c.getAssessmentScore();
            Double overall = c.getOverallScore();
            if (overall == null && assessScore != null) {
                overall = Math.round((0.4 * resScore + 0.6 * assessScore) * 10.0) / 10.0;
            }

            LeaderboardEntryDto entry = LeaderboardEntryDto.builder()
                    .rank(rank++)
                    .candidateId(c.getId())
                    .name(c.getName() != null && !c.getName().isBlank() ? c.getName() : "Candidate")
                    .email(c.getEmail())
                    .companyName(c.getCompanyName() != null && !c.getCompanyName().isBlank() ? c.getCompanyName() : "Standard Corporate Track")
                    .targetRole(c.getTargetRole() != null && !c.getTargetRole().isBlank() ? c.getTargetRole() : "Full Stack Engineer")
                    .expiryDate(c.getExpiryDate())
                    .resumeScore(resScore)
                    .assessmentScore(assessScore)
                    .overallScore(overall)
                    .status(c.getStatus() != null ? c.getStatus().name() : "INVITED")
                    .assessmentToken(c.getToken())
                    .resumeViewUrl("/api/resumes/" + c.getId() + "/pdf")
                    .createdAt(c.getCreatedAt())
                    .completedAt(c.getCompletedAt())
                    .build();

            dtos.add(entry);
        }

        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/companies")
    public ResponseEntity<List<Map<String, Object>>> getCompanies() {
        List<Map<String, Object>> list = companyService.getCompaniesHierarchy();
        if (list.isEmpty()) {
            companyService.syncFromCandidates();
            list = companyService.getCompaniesHierarchy();
        }
        return ResponseEntity.ok(list);
    }

    @GetMapping("/companies/{company}/roles")
    public ResponseEntity<List<Map<String, Object>>> getRolesByCompany(@PathVariable("company") String company) {
        String decodedCompany = URLDecoder.decode(company, StandardCharsets.UTF_8);
        List<Map<String, Object>> roles = companyService.getRolesByCompany(decodedCompany);
        return ResponseEntity.ok(roles);
    }

    @GetMapping("/companies/{company}/roles/{role}/dates")
    public ResponseEntity<List<Map<String, Object>>> getDatesByCompanyAndRole(
            @PathVariable("company") String company,
            @PathVariable("role") String role
    ) {
        String decodedCompany = URLDecoder.decode(company, StandardCharsets.UTF_8);
        String decodedRole = URLDecoder.decode(role, StandardCharsets.UTF_8);
        List<Map<String, Object>> dates = companyService.getDatesByCompanyAndRole(decodedCompany, decodedRole);
        return ResponseEntity.ok(dates);
    }

    @GetMapping("/companies/{company}/roles/{role}/dates/{date}/leaderboard")
    public ResponseEntity<List<LeaderboardEntryDto>> getDateCohortLeaderboard(
            @PathVariable("company") String company,
            @PathVariable("role") String role,
            @PathVariable("date") String dateStr
    ) {
        String decodedCompany = URLDecoder.decode(company, StandardCharsets.UTF_8);
        String decodedRole = URLDecoder.decode(role, StandardCharsets.UTF_8);
        List<LeaderboardEntryDto> leaderboard = companyService.getDateCohortLeaderboard(decodedCompany, decodedRole, dateStr);
        return ResponseEntity.ok(leaderboard);
    }

    @GetMapping("/companies/{company}/roles/{role}/leaderboard")
    public ResponseEntity<List<LeaderboardEntryDto>> getRoleCohortLeaderboard(
            @PathVariable("company") String company,
            @PathVariable("role") String role
    ) {
        String decodedCompany = URLDecoder.decode(company, StandardCharsets.UTF_8);
        String decodedRole = URLDecoder.decode(role, StandardCharsets.UTF_8);
        List<LeaderboardEntryDto> leaderboard = companyService.getRoleCohortLeaderboard(decodedCompany, decodedRole);
        return ResponseEntity.ok(leaderboard);
    }

    @GetMapping("/companies/{company}/roles/{role}/dates/{date}/export-pdf")
    public ResponseEntity<byte[]> exportDateCohortPdf(
            @PathVariable("company") String company,
            @PathVariable("role") String role,
            @PathVariable("date") String dateStr
    ) {
        try {
            String decodedCompany = URLDecoder.decode(company, StandardCharsets.UTF_8);
            String decodedRole = URLDecoder.decode(role, StandardCharsets.UTF_8);
            java.time.LocalDate batchDate = null;
            try {
                batchDate = java.time.LocalDate.parse(dateStr);
            } catch (Exception ignore) {}

            byte[] pdfBytes = leaderboardPdfService.generateCohortDateLeaderboardPdf(decodedCompany, decodedRole, batchDate);

            String filename = decodedCompany.replaceAll("[^a-zA-Z0-9]", "_") + "_" +
                    decodedRole.replaceAll("[^a-zA-Z0-9]", "_") + "_" + dateStr + "_Leaderboard.pdf";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", filename);

            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/companies/{company}/roles/{role}/export-pdf")
    public ResponseEntity<byte[]> exportRoleCohortPdf(
            @PathVariable("company") String company,
            @PathVariable("role") String role
    ) {
        try {
            String decodedCompany = URLDecoder.decode(company, StandardCharsets.UTF_8);
            String decodedRole = URLDecoder.decode(role, StandardCharsets.UTF_8);

            byte[] pdfBytes = leaderboardPdfService.generateCohortLeaderboardPdf(decodedCompany, decodedRole);

            String filename = decodedCompany.replaceAll("[^a-zA-Z0-9]", "_") + "_" +
                    decodedRole.replaceAll("[^a-zA-Z0-9]", "_") + "_Leaderboard.pdf";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", filename);

            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}