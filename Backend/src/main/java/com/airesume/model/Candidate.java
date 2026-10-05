package com.airesume.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "candidates")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Candidate {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "candidate_seq")
    @SequenceGenerator(name = "candidate_seq", sequenceName = "CANDIDATE_SEQ", allocationSize = 1)
    private Long id;

    @Column(nullable = false, unique = true, length = 64)
    private String token;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String email;

    private String phone;

    private String companyName;

    private String targetRole;

    private LocalDateTime expiryDate;

    @Builder.Default
    private java.time.LocalDate batchDate = java.time.LocalDate.now();

    @Lob
    @Column(columnDefinition = "CLOB")
    private String skills;

    private Double resumeScore; // ATS Resume Score (0-100)

    private Double assessmentScore; // 4-Round Assessment Score (0-100)

    private Double overallScore; // Weighted Overall Score (0-100)

    private Integer calculatedRank;

    @Lob
    @Column(columnDefinition = "CLOB")
    private String roundScoresJson; // Round breakdown JSON

    @Lob
    @Column(columnDefinition = "CLOB")
    private String finalReportJson; // Full synthesized final report JSON (recommendations, alternate roles, summary)

    @Lob
    @Column(columnDefinition = "CLOB")
    private String aiFeedback;

    private String pdfFileName;

    @Lob
    @Basic(fetch = FetchType.LAZY)
    private byte[] pdfFileData;

    // Machine Learning Prediction Fields (RandomForestClassifier)
    private String mlPrediction; // "Suitable" or "Not Suitable"

    private Double mlSuitabilityScore; // Model Probability % (0-100)

    @Lob
    @Column(columnDefinition = "CLOB")
    private String mlMatchedSkills;

    @Lob
    @Column(columnDefinition = "CLOB")
    private String mlMissingSkills;

    @Lob
    @Column(columnDefinition = "CLOB")
    private String mlFeatureImportancesJson;

    @Lob
    @Column(columnDefinition = "CLOB")
    private String mlFeaturesJson;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private CandidateStatus status = CandidateStatus.INVITED;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime completedAt;
}
