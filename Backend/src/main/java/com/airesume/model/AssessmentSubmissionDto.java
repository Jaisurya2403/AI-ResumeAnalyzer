package com.airesume.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssessmentSubmissionDto {
    private Map<String, Integer> roundScores; // round1, round2, round3, round4
    private List<Object> round1Answers;
    private List<Object> round2Answers;
    private List<Object> round3Answers;
    private List<Object> round4Transcripts;
    private Boolean violation;
}
