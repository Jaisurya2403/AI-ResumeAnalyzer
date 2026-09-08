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
    private PdfExtractionService pdfExtractionService;

    @Autowired
    private AiScoringService aiScoringService;

    @Autowired
    private EmailNotificationService emailNotificationService;

    @Autowired
    private CandidateRepository candidateRepository;

    public static class ProcessedCandidateSummary {
        public Long id;
        public String name;
        public String email;
        public String targetRole;
        public Double resumeScore;
        public String token;
        public boolean emailSent;
        public String fileName;
    }

    public List<ProcessedCandidateSummary> processZipFile(MultipartFile zipFile) throws Exception {
        if (zipFile == null || zipFile.isEmpty()) {
            throw new IllegalArgumentException("Uploaded ZIP file is empty.");
        }

        List<ProcessedCandidateSummary> results = new ArrayList<>();

        try (InputStream is = zipFile.getInputStream();
             ZipInputStream zis = new ZipInputStream(is)) {

            ZipEntry entry;
            while ((entry = zis.getNextEntry()) != null) {
                String entryName = entry.getName();

                // Skip directories, mac hidden files, and non-PDFs
                if (entry.isDirectory() || entryName.startsWith("__MACOSX") || entryName.startsWith(".") || !entryName.toLowerCase().endsWith(".pdf")) {
                    zis.closeEntry();
                    continue;
                }

                // Read PDF bytes
                ByteArrayOutputStream baos = new ByteArrayOutputStream();
                byte[] buffer = new byte[4096];
                int len;
                while ((len = zis.read(buffer)) > 0) {
                    baos.write(buffer, 0, len);
                }
                byte[] pdfBytes = baos.toByteArray();
                zis.closeEntry();

                if (pdfBytes.length == 0) continue;

                // 1. Extract PDF text
                String resumeText = pdfExtractionService.extractTextFromPdfBytes(pdfBytes);

                // 2. Parse & Score Resume with AI
                AiScoringService.ParsedResumeResult parsed = aiScoringService.parseAndScoreResume(resumeText, entryName);

                // 3. Generate unique secure token
                String token = UUID.randomUUID().toString().replace("-", "");

                // 4. Save Candidate to DB
                Candidate candidate = Candidate.builder()
                        .token(token)
                        .name(parsed.name)
                        .email(parsed.email)
                        .phone(parsed.phone)
                        .targetRole(parsed.targetRole)
                        .skills(parsed.skills)
                        .resumeScore(parsed.resumeScore)
                        .pdfFileName(entryName.substring(entryName.lastIndexOf('/') + 1))
                        .pdfFileData(pdfBytes)
                        .status(CandidateStatus.INVITED)
                        .createdAt(LocalDateTime.now())
                        .build();

                candidate = candidateRepository.save(candidate);

                // 5. Send Assessment Invitation Email
                boolean emailSent = emailNotificationService.sendAssessmentInvitation(
                        candidate.getEmail(),
                        candidate.getName(),
                        candidate.getTargetRole(),
                        candidate.getToken()
                );

                ProcessedCandidateSummary summary = new ProcessedCandidateSummary();
                summary.id = candidate.getId();
                summary.name = candidate.getName();
                summary.email = candidate.getEmail();
                summary.targetRole = candidate.getTargetRole();
                summary.resumeScore = candidate.getResumeScore();
                summary.token = candidate.getToken();
                summary.emailSent = emailSent;
                summary.fileName = candidate.getPdfFileName();

                results.add(summary);
            }
        }

        return results;
    }
}
