package com.airesume.controller;

import com.airesume.model.Candidate;
import com.airesume.model.CandidateStatus;
import com.airesume.repository.CandidateRepository;
import com.airesume.service.AuthService;
import com.airesume.service.CompanyService;
import com.airesume.service.DocumentExtractionService;
import com.airesume.service.LeaderboardPdfService;
import com.airesume.service.ZipResumeProcessorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;

@RestController
@RequestMapping("/api/resumes")
@CrossOrigin(origins = "*")
public class ResumeBatchController {

    @Autowired
    private ZipResumeProcessorService zipResumeProcessorService;

    @Autowired
    private DocumentExtractionService documentExtractionService;

    @Autowired
    private CandidateRepository candidateRepository;

    @Autowired
    private CompanyService companyService;

    @Autowired
    private AuthService authService;

    @Autowired
    private LeaderboardPdfService leaderboardPdfService;

    @PostMapping(value = "/extract-text", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> extractTextFromDocument(@RequestParam("file") MultipartFile file) {
        try {
            if (file == null || file.isEmpty()) {
                Map<String, Object> err = new HashMap<>();
                err.put("status", "ERROR");
                err.put("message", "Uploaded document is empty.");
                return ResponseEntity.badRequest().body(err);
            }
            byte[] bytes = file.getBytes();
            String text = documentExtractionService.extractText(bytes, file.getOriginalFilename());
            Map<String, Object> res = new HashMap<>();
            res.put("status", "SUCCESS");
            res.put("fileName", file.getOriginalFilename());
            res.put("text", text);
            return ResponseEntity.ok(res);
        } catch (Exception e) {
            Map<String, Object> err = new HashMap<>();
            err.put("status", "ERROR");
            err.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(err);
        }
    }

    @PostMapping("/upload-zip")
    public ResponseEntity<?> uploadZipFile(
            @RequestParam("file") MultipartFile zipFile,
            @RequestParam(value = "companyName", required = false) String companyName,
            @RequestParam(value = "targetRole", required = false) String targetRole,
            @RequestParam(value = "expiryDate", required = false) String expiryDateStr
    ) {
        try {
            java.time.LocalDateTime expiryDate = null;
            if (expiryDateStr != null && !expiryDateStr.isBlank()) {
                try {
                    expiryDate = java.time.LocalDateTime.parse(expiryDateStr.replace("Z", ""));
                } catch (Exception pe) {
                    try {
                        expiryDate = java.time.LocalDate.parse(expiryDateStr).atTime(23, 59, 59);
                    } catch (Exception ignore) {}
                }
            }

            List<ZipResumeProcessorService.ProcessedCandidateSummary> summaries =
                    zipResumeProcessorService.processZipFile(zipFile, companyName, targetRole, expiryDate);

            Map<String, Object> response = new HashMap<>();
            response.put("status", "SUCCESS");
            response.put("processedCount", summaries.size());
            response.put("companyName", companyName != null ? companyName : "General");
            response.put("targetRole", targetRole != null ? targetRole : "Extracted Roles");
            response.put("expiryDate", expiryDate);
            response.put("candidates", summaries);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> err = new HashMap<>();
            err.put("status", "ERROR");
            err.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(err);
        }
    }

    @PostMapping("/save-evaluation")
    public ResponseEntity<?> saveSingleEvaluation(
            @RequestBody Map<String, Object> payload,
            @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        try {
            String token = (String) payload.get("token");
            Long candidateId = null;
            if (payload.get("candidateId") != null) {
                try {
                    candidateId = Long.valueOf(payload.get("candidateId").toString());
                } catch (Exception ignore) {}
            }

            // Determine email from auth header if available or payload
            String email = (String) payload.get("email");
            if (authHeader != null && !authHeader.isBlank()) {
                Optional<com.airesume.model.User> optUser = authService.getUserFromToken(authHeader);
                if (optUser.isPresent()) {
                    email = optUser.get().getEmail();
                }
            }
            if (email != null) {
                email = email.trim();
            }

            String targetRole = (String) payload.get("targetRole");
            if (targetRole == null || targetRole.isBlank()) {
                targetRole = (String) payload.get("jobRole");
            }

            Candidate candidate = null;
            if (candidateId != null) {
                candidate = candidateRepository.findById(candidateId).orElse(null);
            }
            if (candidate == null && token != null && !token.isBlank()) {
                candidate = candidateRepository.findByToken(token).orElse(null);
            }

            // If not updating an explicitly identified existing session, create a brand new candidate record
            if (candidate == null) {
                candidate = new Candidate();
                candidate.setToken(UUID.randomUUID().toString());
                candidate.setCreatedAt(java.time.LocalDateTime.now());
                candidate.setBatchDate(java.time.LocalDate.now());
                candidate.setEmail(email != null && !email.isBlank() ? email : "candidate@evalai.com");
            } else if (email != null && !email.isBlank() && !email.equalsIgnoreCase("candidate@evalai.com") && !email.equalsIgnoreCase("user@evalai.com")) {
                candidate.setEmail(email);
            } else if (candidate.getEmail() == null || candidate.getEmail().isBlank()) {
                candidate.setEmail(email != null && !email.isBlank() ? email : "candidate@evalai.com");
            }

            String name = (String) payload.get("name");
            if (name == null || name.isBlank()) {
                name = (String) payload.get("candidateName");
            }
            if (name != null && !name.isBlank() && !name.equalsIgnoreCase("Candidate")) {
                candidate.setName(name.trim());
            } else if (candidate.getName() == null || candidate.getName().isBlank()) {
                candidate.setName(name != null && !name.isBlank() ? name.trim() : "Candidate");
            }

            if (targetRole != null && !targetRole.isBlank()) {
                candidate.setTargetRole(targetRole.trim());
            } else if (candidate.getTargetRole() == null || candidate.getTargetRole().isBlank()) {
                candidate.setTargetRole("Fullstack Engineer");
            }

            String companyName = (String) payload.get("companyName");
            if (companyName == null || companyName.isBlank()) {
                companyName = (String) payload.get("company");
            }
            if (companyName != null && !companyName.isBlank()) {
                candidate.setCompanyName(companyName.trim());
            } else if (candidate.getCompanyName() == null || candidate.getCompanyName().isBlank()) {
                candidate.setCompanyName("Standard Corporate Track");
            }

            if (payload.get("resumeScore") != null) {
                try {
                    candidate.setResumeScore(Double.valueOf(payload.get("resumeScore").toString()));
                } catch (Exception ignore) {}
            } else if (payload.get("atsScore") != null) {
                try {
                    candidate.setResumeScore(Double.valueOf(payload.get("atsScore").toString()));
                } catch (Exception ignore) {}
            }

            if (payload.get("assessmentScore") != null) {
                try {
                    candidate.setAssessmentScore(Double.valueOf(payload.get("assessmentScore").toString()));
                } catch (Exception ignore) {}
            }

            if (payload.get("overallScore") != null) {
                try {
                    candidate.setOverallScore(Double.valueOf(payload.get("overallScore").toString()));
                } catch (Exception ignore) {}
            } else if (candidate.getAssessmentScore() != null && candidate.getResumeScore() != null) {
                double calc = Math.round((0.4 * candidate.getResumeScore() + 0.6 * candidate.getAssessmentScore()) * 10.0) / 10.0;
                candidate.setOverallScore(calc);
            }

            String statusStr = (String) payload.get("status");
            if (statusStr != null && !statusStr.isBlank()) {
                try {
                    CandidateStatus st = CandidateStatus.valueOf(statusStr.toUpperCase().trim());
                    candidate.setStatus(st);
                    if (st == CandidateStatus.COMPLETED) {
                        candidate.setCompletedAt(java.time.LocalDateTime.now());
                    }
                } catch (Exception ignore) {}
            } else if (candidate.getStatus() == null) {
                candidate.setStatus(CandidateStatus.COMPLETED);
                candidate.setCompletedAt(java.time.LocalDateTime.now());
            }

            if (payload.get("skills") != null) {
                Object skillsObj = payload.get("skills");
                if (skillsObj instanceof List) {
                    candidate.setSkills(String.join(", ", (List<String>) skillsObj));
                } else {
                    candidate.setSkills(skillsObj.toString());
                }
            }

            if (payload.get("summary") != null) {
                candidate.setAiFeedback(payload.get("summary").toString());
            }

            if (payload.get("roundScores") != null) {
                try {
                    Object rs = payload.get("roundScores");
                    if (rs instanceof Map || rs instanceof List) {
                        candidate.setRoundScoresJson(new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(rs));
                    } else {
                        candidate.setRoundScoresJson(rs.toString());
                    }
                } catch (Exception ignore) {}
            }

            if (payload.get("finalReport") != null) {
                try {
                    Object fr = payload.get("finalReport");
                    if (fr instanceof Map || fr instanceof List) {
                        candidate.setFinalReportJson(new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(fr));
                    } else {
                        candidate.setFinalReportJson(fr.toString());
                    }
                } catch (Exception ignore) {}
            } else if (payload.get("finalReportJson") != null) {
                candidate.setFinalReportJson(payload.get("finalReportJson").toString());
            }

            if (payload.get("pdfBase64") != null) {
                try {
                    String base64 = payload.get("pdfBase64").toString();
                    if (base64.contains(",")) {
                        base64 = base64.substring(base64.indexOf(",") + 1);
                    }
                    candidate.setPdfFileData(java.util.Base64.getDecoder().decode(base64));
                } catch (Exception ignore) {}
            }
            if (payload.get("pdfFileName") != null) {
                candidate.setPdfFileName(payload.get("pdfFileName").toString());
            }

            // Save Machine Learning Suitability Prediction fields
            if (payload.get("mlPrediction") != null) {
                candidate.setMlPrediction(payload.get("mlPrediction").toString());
            }
            if (payload.get("mlSuitabilityScore") != null) {
                try {
                    candidate.setMlSuitabilityScore(Double.valueOf(payload.get("mlSuitabilityScore").toString()));
                } catch (Exception ignore) {}
            }
            if (payload.get("mlMatchedSkills") != null) {
                Object msObj = payload.get("mlMatchedSkills");
                if (msObj instanceof List) {
                    candidate.setMlMatchedSkills(String.join(", ", (List<String>) msObj));
                } else {
                    candidate.setMlMatchedSkills(msObj.toString());
                }
            }
            if (payload.get("mlMissingSkills") != null) {
                Object msObj = payload.get("mlMissingSkills");
                if (msObj instanceof List) {
                    candidate.setMlMissingSkills(String.join(", ", (List<String>) msObj));
                } else {
                    candidate.setMlMissingSkills(msObj.toString());
                }
            }
            if (payload.get("mlFeatureImportances") != null) {
                try {
                    candidate.setMlFeatureImportancesJson(new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(payload.get("mlFeatureImportances")));
                } catch (Exception ignore) {}
            }
            if (payload.get("mlFeatures") != null) {
                try {
                    candidate.setMlFeaturesJson(new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(payload.get("mlFeatures")));
                } catch (Exception ignore) {}
            }

            candidate = candidateRepository.save(candidate);

            try {
                companyService.syncFromCandidates();
            } catch (Exception ignore) {}

            Map<String, Object> resp = new HashMap<>();
            resp.put("success", true);
            resp.put("candidateId", candidate.getId());
            resp.put("token", candidate.getToken());
            resp.put("candidate", candidate);
            return ResponseEntity.ok(resp);
        } catch (Exception e) {
            Map<String, Object> err = new HashMap<>();
            err.put("success", false);
            err.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(err);
        }
    }

    @GetMapping("/{id}/pdf")
    public ResponseEntity<byte[]> getResumePdf(@PathVariable Long id) {
        Optional<Candidate> opt = candidateRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Candidate c = opt.get();
        byte[] data = c.getPdfFileData();
        String fileName = c.getPdfFileName() != null ? c.getPdfFileName() : ((c.getName() != null ? c.getName().replaceAll("[^a-zA-Z0-9_]", "_") : "Candidate") + "_Evaluation_Dossier.pdf");

        if (data == null || data.length == 0) {
            try {
                data = leaderboardPdfService.generateCandidateDossierPdf(c);
                fileName = (c.getName() != null ? c.getName().replaceAll("[^a-zA-Z0-9_]", "_") : "Candidate") + "_Evaluation_Dossier.pdf";
            } catch (Exception e) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
            }
        }

        String lower = fileName.toLowerCase();
        MediaType mediaType;
        if (lower.endsWith(".png")) {
            mediaType = MediaType.IMAGE_PNG;
        } else if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) {
            mediaType = MediaType.IMAGE_JPEG;
        } else if (lower.endsWith(".webp")) {
            mediaType = MediaType.parseMediaType("image/webp");
        } else if (lower.endsWith(".gif")) {
            mediaType = MediaType.IMAGE_GIF;
        } else if (lower.endsWith(".docx")) {
            mediaType = MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.wordprocessingml.document");
        } else if (lower.endsWith(".doc")) {
            mediaType = MediaType.parseMediaType("application/msword");
        } else if (lower.endsWith(".txt") || lower.endsWith(".md") || lower.endsWith(".csv") || lower.endsWith(".json")) {
            mediaType = MediaType.TEXT_PLAIN;
        } else if (lower.endsWith(".html") || lower.endsWith(".htm")) {
            mediaType = MediaType.TEXT_HTML;
        } else {
            mediaType = MediaType.APPLICATION_PDF;
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(mediaType);
        headers.set(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + fileName + "\"");

        return new ResponseEntity<>(data, headers, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCandidateEvaluation(@PathVariable Long id) {
        if (candidateRepository.existsById(id)) {
            candidateRepository.deleteById(id);
            try {
                companyService.syncFromCandidates();
            } catch (Exception ignore) {}
            Map<String, Object> resp = new HashMap<>();
            resp.put("success", true);
            resp.put("message", "Evaluation deleted successfully.");
            return ResponseEntity.ok(resp);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/evaluations/{id}")
    public ResponseEntity<?> deleteCandidateEvaluationAlias(@PathVariable Long id) {
        return deleteCandidateEvaluation(id);
    }
}
