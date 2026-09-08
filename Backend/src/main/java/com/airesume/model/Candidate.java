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
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 64)
    private String token;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String email;

    private String phone;

    private String targetRole;

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
    private String aiFeedback;

    private String pdfFileName;

    @Lob
    @Basic(fetch = FetchType.LAZY)
    private byte[] pdfFileData;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private CandidateStatus status = CandidateStatus.INVITED;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime completedAt;
}
