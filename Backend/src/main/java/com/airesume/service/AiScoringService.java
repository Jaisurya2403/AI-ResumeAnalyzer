package com.airesume.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class AiScoringService {

    @Value("${groq.api.url:https://api.groq.com/openai/v1/chat/completions}")
    private String groqApiUrl;

    @Value("${groq.api.model:qwen-2.5-32b}")
    private String groqModel;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final RestTemplate restTemplate = new RestTemplate();

    public static class ParsedResumeResult {
        public String name;
        public String email;
        public String phone;
        public String targetRole;
        public String skills;
        public Double resumeScore;
    }

    public ParsedResumeResult parseAndScoreResume(String resumeText, String fileName) {
        ParsedResumeResult result = new ParsedResumeResult();
        
        // Fallback email and phone regex extraction
        String detectedEmail = extractEmailWithRegex(resumeText);
        String detectedPhone = extractPhoneWithRegex(resumeText);

        String prompt = "You are an ATS Resume Analyzer. Given the following resume text, extract candidate information and compute an ATS Resume Score (0-100) based on skill depth, clarity, and project experience.\n\n"
                + "Return ONLY a JSON object with this exact structure (no markdown fences, no explanation):\n"
                + "{\n"
                + "  \"name\": \"Candidate Full Name\",\n"
                + "  \"email\": \"email@example.com\",\n"
                + "  \"phone\": \"phone or null\",\n"
                + "  \"targetRole\": \"e.g. Full Stack Engineer, Frontend Developer, Backend Developer, Data Scientist, etc.\",\n"
                + "  \"skills\": \"Comma separated list of top 8 skills\",\n"
                + "  \"resumeScore\": 85\n"
                + "}\n\n"
                + "Resume Content:\n" + (resumeText.length() > 3000 ? resumeText.substring(0, 3000) : resumeText);

        try {
            // Attempt Groq call if key is available in env
            String apiKey = System.getenv("GROQ_API_KEY");
            if (apiKey != null && !apiKey.isBlank()) {
                Map<String, Object> reqBody = new HashMap<>();
                reqBody.put("model", groqModel);
                reqBody.put("temperature", 0.2);
                
                Map<String, String> sysMsg = new HashMap<>();
                sysMsg.put("role", "system");
                sysMsg.put("content", "You are an expert HR Talent Evaluator. Return ONLY valid JSON.");

                Map<String, String> userMsg = new HashMap<>();
                userMsg.put("role", "user");
                userMsg.put("content", prompt);

                reqBody.put("messages", List.of(sysMsg, userMsg));

                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);
                headers.setBearerAuth(apiKey);

                HttpEntity<Map<String, Object>> entity = new HttpEntity<>(reqBody, headers);
                ResponseEntity<String> response = restTemplate.postForEntity(groqApiUrl, entity, String.class);

                if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                    JsonNode root = objectMapper.readTree(response.getBody());
                    String content = root.path("choices").get(0).path("message").path("content").asText();
                    content = cleanJsonString(content);
                    JsonNode parsed = objectMapper.readTree(content);

                    result.name = parsed.path("name").asText("Candidate");
                    result.email = parsed.path("email").asText(detectedEmail);
                    result.phone = parsed.path("phone").asText(detectedPhone);
                    result.targetRole = parsed.path("targetRole").asText("Software Engineer");
                    result.skills = parsed.path("skills").asText("Java, Python, React, SQL");
                    result.resumeScore = parsed.path("resumeScore").asDouble(82.0);
                    return result;
                }
            }
        } catch (Exception e) {
            System.err.println("AI Parser exception, using smart heuristic: " + e.getMessage());
        }

        // Smart Heuristic Fallback
        String cleanName = extractNameHeuristic(resumeText, fileName);
        result.name = cleanName;
        result.email = detectedEmail != null ? detectedEmail : "candidate." + Math.abs(fileName.hashCode()) + "@example.com";
        result.phone = detectedPhone != null ? detectedPhone : "+1 (555) 019-2834";
        result.targetRole = extractRoleHeuristic(resumeText);
        result.skills = extractSkillsHeuristic(resumeText);
        result.resumeScore = calculateAtsScoreHeuristic(resumeText);

        return result;
    }

    public Double calculateOverallScore(Double resumeScore, Double assessmentScore) {
        double rScore = (resumeScore != null) ? resumeScore : 75.0;
        double aScore = (assessmentScore != null) ? assessmentScore : 80.0;
        // Weighted: 35% Resume ATS, 65% Live Assessment performance
        return Math.round(((rScore * 0.35) + (aScore * 0.65)) * 10.0) / 10.0;
    }

    private String cleanJsonString(String raw) {
        if (raw == null) return "{}";
        String s = raw.trim();
        if (s.startsWith("```json")) s = s.substring(7);
        if (s.startsWith("```")) s = s.substring(3);
        if (s.endsWith("```")) s = s.substring(0, s.length() - 3);
        return s.trim();
    }

    private String extractEmailWithRegex(String text) {
        Pattern pattern = Pattern.compile("(?i)[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}");
        Matcher matcher = pattern.matcher(text);
        if (matcher.find()) {
            return matcher.group();
        }
        return null;
    }

    private String extractPhoneWithRegex(String text) {
        Pattern pattern = Pattern.compile("(\\+?\\d{1,3}[-.\\s]?)?\\(?\\d{3}\\)?[-.\\s]?\\d{3}[-.\\s]?\\d{4}");
        Matcher matcher = pattern.matcher(text);
        if (matcher.find()) {
            return matcher.group();
        }
        return null;
    }

    private String extractNameHeuristic(String text, String fileName) {
        String[] lines = text.split("\n");
        for (String line : lines) {
            String trimmed = line.trim();
            if (trimmed.length() > 2 && trimmed.length() < 35 && !trimmed.toLowerCase().contains("resume") && !trimmed.toLowerCase().contains("curriculum")) {
                return trimmed;
            }
        }
        String cleanFile = fileName.replaceAll("(?i)\\.pdf$", "").replaceAll("[-_]", " ");
        return cleanFile.isEmpty() ? "Candidate" : cleanFile;
    }

    private String extractRoleHeuristic(String text) {
        String lower = text.toLowerCase();
        if (lower.contains("full stack") || lower.contains("fullstack")) return "Full Stack Engineer";
        if (lower.contains("frontend") || lower.contains("react")) return "Frontend Developer";
        if (lower.contains("backend") || lower.contains("spring") || lower.contains("java") || lower.contains("node")) return "Backend Developer";
        if (lower.contains("data scientist") || lower.contains("machine learning") || lower.contains("ai")) return "AI / ML Engineer";
        if (lower.contains("embedded") || lower.contains("hardware")) return "Embedded Systems Engineer";
        return "Software Engineer";
    }

    private String extractSkillsHeuristic(String text) {
        List<String> found = new ArrayList<>();
        String lower = text.toLowerCase();
        String[] pool = {"Java", "Python", "React", "TypeScript", "JavaScript", "Spring Boot", "SQL", "Docker", "Kubernetes", "AWS", "Git", "REST APIs", "Node.js"};
        for (String s : pool) {
            if (lower.contains(s.toLowerCase())) {
                found.add(s);
            }
        }
        if (found.isEmpty()) return "Java, Spring Boot, React, SQL, REST APIs";
        return String.join(", ", found);
    }

    private Double calculateAtsScoreHeuristic(String text) {
        double score = 70.0;
        String lower = text.toLowerCase();
        if (text.length() > 800) score += 8.0;
        if (lower.contains("project") || lower.contains("experience")) score += 6.0;
        if (lower.contains("education") || lower.contains("university") || lower.contains("b.s") || lower.contains("b.tech")) score += 5.0;
        if (lower.contains("github") || lower.contains("linkedin")) score += 5.0;
        return Math.min(96.0, score);
    }
}
