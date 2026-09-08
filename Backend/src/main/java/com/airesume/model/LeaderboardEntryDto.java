package com.airesume.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeaderboardEntryDto {
    private Integer rank;
    private Long candidateId;
    private String name;
    private String email;
    private String targetRole;
    private Double resumeScore;
    private Double assessmentScore;
    private Double overallScore;
    private String status;
    private String resumeViewUrl;
    private String companyName;
    private String assessmentToken;
    private LocalDateTime expiryDate;
    private LocalDateTime completedAt;
    private LocalDateTime createdAt;
}
