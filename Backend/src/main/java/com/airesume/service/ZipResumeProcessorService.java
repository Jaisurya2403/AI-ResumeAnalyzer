package com.airesume.service;

import com.airesume.model.Candidate;
import com.airesume.model.CandidateStatus;
import com.airesume.repository.CandidateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.time.LocalDateTime;
import java.util.*;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

@Service
public class ZipResumeProcessorService {

    @Autowired
    private DocumentExtractionService documentExtractionService;

    @Autowired
    private AiScoringService aiScoringService;

    @Autowired
    private EmailNotificationService emailNotificationService;

    @Autowired
    private CandidateRepository candidateRepository;

    @Autowired
    private CompanyService companyService;

    public static class ProcessedCandidateSummary {
        public Long id;
        public String name;
        public String email;
        public String companyName;
        public String targetRole;
        public Double resumeScore;
        public String token;
        public boolean emailSent;
        public String fileName;
        public LocalDateTime expiryDate;
    }

    public List<ProcessedCandidateSummary> processZipFile(MultipartFile zipFile, String companyName, String targetRole, LocalDateTime expiryDate) throws Exception {
        if (zipFile == null || zipFile.isEmpty()) {
            throw new IllegalArgumentException("Uploaded ZIP file is empty.");
        }

        List<ProcessedCandidateSummary> results = new ArrayList<>();
        String company = (companyName != null && !companyName.isBlank()) ? companyName.trim() : "General";

        try (InputStream is = zipFile.getInputStream();
             ZipInputStream zis = new ZipInputStream(is)) {

            ZipEntry entry;
            while ((entry = zis.getNextEntry()) != null) {
                String entryName = entry.getName();

                // Skip directories, mac hidden files, metadata, and non-document binaries
                if (entry.isDirectory() || entryName.startsWith("__MACOSX") || entryName.startsWith(".") 
                        || entryName.endsWith("/.DS_Store") || entryName.toLowerCase().endsWith(".exe")
                        || entryName.toLowerCase().endsWith(".dll") || entryName.toLowerCase().endsWith(".class")
                        || entryName.toLowerCase().endsWith(".jar") || entryName.toLowerCase().endsWith(".zip")) {
                    zis.closeEntry();
                    continue;
                }

                // Read file bytes
                ByteArrayOutputStream baos = new ByteArrayOutputStream();
                byte[] buffer = new byte[4096];
                int len;
                while ((len = zis.read(buffer)) > 0) {
                    baos.write(buffer, 0, len);
                }
                byte[] fileBytes = baos.toByteArray();
                zis.closeEntry();

                if (fileBytes.length == 0) continue;

                // 1. Detect Document Type & Extract Content / Score
                DocumentExtractionService.DocumentType docType = documentExtractionService.detectDocumentType(entryName, fileBytes);
                AiScoringService.ParsedResumeResult parsed;

                if (docType == DocumentExtractionService.DocumentType.IMAGE) {
                    // Extract candidate details & score directly from Resume Image via Vision AI / OCR
                    parsed = aiScoringService.parseAndScoreImageResume(fileBytes, entryName);
                } else {
                    // Extract text from PDF, Word (.docx/.doc), RTF, HTML, TXT, Markdown, etc.
                    String resumeText = documentExtractionService.extractText(fileBytes, entryName);
                    parsed = aiScoringService.parseAndScoreResume(resumeText, entryName);
                }

                // 2. Generate unique secure token
                String token = UUID.randomUUID().toString().replace("-", "");

                // Use user-provided role if available, else AI-extracted role
                String finalRole = (targetRole != null && !targetRole.isBlank()) ? targetRole.trim() : (parsed.targetRole != null ? parsed.targetRole : "Software Engineer");

                // 3. Ensure Company and Role entities exist in database tables with canonical normalization
                com.airesume.model.Company matchedCompany = companyService.findOrCreateCompany(company);
                com.airesume.model.JobRole matchedRole = companyService.findOrCreateRole(matchedCompany, finalRole);

                // 4. Save Candidate to DB
                Candidate candidate = Candidate.builder()
                        .token(token)
                        .name(parsed.name)
                        .email(parsed.email)
                        .phone(parsed.phone)
                        .companyName(matchedCompany.getName())
                        .targetRole(matchedRole.getRoleName())
                        .expiryDate(expiryDate)
                        .batchDate(java.time.LocalDate.now())
                        .skills(parsed.skills)
                        .resumeScore(parsed.resumeScore)
                        .pdfFileName(entryName.substring(entryName.lastIndexOf('/') + 1))
                        .pdfFileData(fileBytes)
                        .status(CandidateStatus.INVITED)
                        .createdAt(LocalDateTime.now())
                        .build();

                candidate = candidateRepository.save(candidate);

                // 5. Send Assessment Invitation Email
                boolean emailSent = emailNotificationService.sendAssessmentInvitation(
                        candidate.getEmail(),
                        candidate.getName(),
                        candidate.getCompanyName(),
                        candidate.getTargetRole(),
                        candidate.getToken(),
                        candidate.getExpiryDate()
                );

                ProcessedCandidateSummary summary = new ProcessedCandidateSummary();
                summary.id = candidate.getId();
                summary.name = candidate.getName();
                summary.email = candidate.getEmail();
                summary.companyName = candidate.getCompanyName();
                summary.targetRole = candidate.getTargetRole();
                summary.resumeScore = candidate.getResumeScore();
                summary.token = candidate.getToken();
                summary.emailSent = emailSent;
                summary.fileName = candidate.getPdfFileName();
                summary.expiryDate = candidate.getExpiryDate();

                results.add(summary);
            }
        }

        return results;
    }
}
