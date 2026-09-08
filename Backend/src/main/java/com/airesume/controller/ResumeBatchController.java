package com.airesume.controller;

import com.airesume.model.Candidate;
import com.airesume.repository.CandidateRepository;
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
    private CandidateRepository candidateRepository;

    @PostMapping("/upload-zip")
    public ResponseEntity<?> uploadZipFile(@RequestParam("file") MultipartFile zipFile) {
        try {
            List<ZipResumeProcessorService.ProcessedCandidateSummary> summaries = zipResumeProcessorService.processZipFile(zipFile);
            Map<String, Object> response = new HashMap<>();
            response.put("status", "SUCCESS");
            response.put("processedCount", summaries.size());
            response.put("candidates", summaries);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> err = new HashMap<>();
            err.put("status", "ERROR");
            err.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(err);
        }
    }

    @GetMapping("/{id}/pdf")
    public ResponseEntity<byte[]> getResumePdf(@PathVariable Long id) {
        Optional<Candidate> opt = candidateRepository.findById(id);
        if (opt.isEmpty() || opt.get().getPdfFileData() == null) {
            return ResponseEntity.notFound().build();
        }

        Candidate c = opt.get();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("inline", c.getPdfFileName() != null ? c.getPdfFileName() : "resume.pdf");

        return new ResponseEntity<>(c.getPdfFileData(), headers, HttpStatus.OK);
    }
}
