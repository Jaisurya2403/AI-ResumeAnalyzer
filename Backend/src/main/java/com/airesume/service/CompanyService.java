package com.airesume.service;

import com.airesume.model.Candidate;
import com.airesume.model.Company;
import com.airesume.model.JobRole;
import com.airesume.repository.CandidateRepository;
import com.airesume.repository.CompanyRepository;
import com.airesume.repository.JobRoleRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class CompanyService {

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private JobRoleRepository jobRoleRepository;

    @Autowired
    private CandidateRepository candidateRepository;

    /**
     * Normalizes a company or role string by removing all whitespace and converting to lowercase.
     * e.g. "Full Stack" -> "fullstack", "FULLSTACK" -> "fullstack", " Google Inc " -> "googleinc"
     */
    public static String normalizeKey(String input) {
        if (input == null) return "";
        return input.replaceAll("\\s+", "").toLowerCase();
    }

    @PostConstruct
    public void initSync() {
        try {
            syncAndDeduplicate();
        } catch (Exception e) {
            System.err.println("Company deduplication and sync warning: " + e.getMessage());
        }
    }

    public Company findOrCreateCompany(String companyName) {
        String cleanCompany = (companyName != null && !companyName.trim().isEmpty()) ? companyName.trim() : "General";
        String normCompKey = normalizeKey(cleanCompany);

        List<Company> allCompanies = companyRepository.findAll();
        for (Company c : allCompanies) {
            if (normalizeKey(c.getName()).equals(normCompKey)) {
                return c;
            }
        }

        Company newComp = Company.builder()
                .name(cleanCompany)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        return companyRepository.save(newComp);
    }

    public JobRole findOrCreateRole(Company company, String roleName) {
        String cleanRole = (roleName != null && !roleName.trim().isEmpty()) ? roleName.trim() : "Software Engineer";
        String normRoleKey = normalizeKey(cleanRole);

        List<JobRole> roles = jobRoleRepository.findByCompanyOrderByRoleNameAsc(company);
        for (JobRole r : roles) {
            if (normalizeKey(r.getRoleName()).equals(normRoleKey)) {
                return r;
            }
        }

        JobRole newRole = JobRole.builder()
                .company(company)
                .roleName(cleanRole)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        return jobRoleRepository.save(newRole);
    }

    @Transactional
    public Company findOrCreateCompanyAndRole(String companyName, String roleName) {
        Company company = findOrCreateCompany(companyName);
        company.setUpdatedAt(LocalDateTime.now());
        company = companyRepository.save(company);

        JobRole role = findOrCreateRole(company, roleName);
        role.setUpdatedAt(LocalDateTime.now());
        jobRoleRepository.save(role);

        return company;
    }

    @Transactional
    public void syncFromCandidates() {
        syncAndDeduplicate();
    }

    @Transactional
    public void syncAndDeduplicate() {
        List<Candidate> allCandidates = candidateRepository.findAll();
        boolean candidateUpdated = false;

        for (Candidate c : allCandidates) {
            if (c.getCompanyName() == null || c.getCompanyName().trim().isEmpty()) {
                c.setCompanyName("General");
                candidateUpdated = true;
            }
            if (c.getTargetRole() == null || c.getTargetRole().trim().isEmpty()) {
                c.setTargetRole("Software Engineer");
                candidateUpdated = true;
            }
            if (c.getBatchDate() == null) {
                c.setBatchDate(c.getCreatedAt() != null ? c.getCreatedAt().toLocalDate() : java.time.LocalDate.now());
                candidateUpdated = true;
            }
        }

        // 1. Deduplicate Companies table
        List<Company> allCompanies = companyRepository.findAll();
        Map<String, List<Company>> companyGroups = new HashMap<>();
        for (Company c : allCompanies) {
            String key = normalizeKey(c.getName());
            companyGroups.computeIfAbsent(key, k -> new ArrayList<>()).add(c);
        }

        for (Map.Entry<String, List<Company>> entry : companyGroups.entrySet()) {
            List<Company> group = entry.getValue();
            Company primary = group.get(0);

            if (group.size() > 1) {
                for (int i = 1; i < group.size(); i++) {
                    Company duplicate = group.get(i);
                    List<JobRole> dupRoles = jobRoleRepository.findByCompanyOrderByRoleNameAsc(duplicate);
                    for (JobRole dr : dupRoles) {
                        dr.setCompany(primary);
                        jobRoleRepository.save(dr);
                    }
                    jobRoleRepository.flush();
                    companyRepository.delete(duplicate);
                }
            }

            // Unify candidate company names
            for (Candidate c : allCandidates) {
                if (normalizeKey(c.getCompanyName()).equals(entry.getKey())) {
                    if (!c.getCompanyName().equals(primary.getName())) {
                        c.setCompanyName(primary.getName());
                        candidateUpdated = true;
                    }
                }
            }
        }

        if (candidateUpdated) {
            candidateRepository.saveAll(allCandidates);
            candidateRepository.flush();
        }
        companyRepository.flush();

        // 2. Deduplicate Job Roles table for each Company
        List<Company> consolidatedCompanies = companyRepository.findAll();
        for (Company comp : consolidatedCompanies) {
            List<JobRole> roles = jobRoleRepository.findByCompanyOrderByRoleNameAsc(comp);
            Map<String, List<JobRole>> roleGroups = new HashMap<>();
            for (JobRole r : roles) {
                String rKey = normalizeKey(r.getRoleName());
                roleGroups.computeIfAbsent(rKey, k -> new ArrayList<>()).add(r);
            }

            for (Map.Entry<String, List<JobRole>> rEntry : roleGroups.entrySet()) {
                List<JobRole> rList = rEntry.getValue();
                
                // Pick canonical role: choose the one with candidates, or formatted/first one
                JobRole canonicalRole = rList.get(0);
                for (JobRole candidateRole : rList) {
                    long count = candidateRepository.countByNormalizedCompanyAndRole(comp.getName(), candidateRole.getRoleName());
                    if (count > 0) {
                        canonicalRole = candidateRole;
                        break;
                    }
                }

                // Delete any duplicate roles
                for (JobRole r : rList) {
                    if (!r.getId().equals(canonicalRole.getId())) {
                        jobRoleRepository.delete(r);
                    }
                }

                // Unify candidate target roles
                for (Candidate c : allCandidates) {
                    if (normalizeKey(c.getCompanyName()).equals(normalizeKey(comp.getName())) &&
                        normalizeKey(c.getTargetRole()).equals(rEntry.getKey())) {
                        if (!c.getTargetRole().equals(canonicalRole.getRoleName())) {
                            c.setTargetRole(canonicalRole.getRoleName());
                            candidateUpdated = true;
                        }
                    }
                }
            }
        }

        if (candidateUpdated) {
            candidateRepository.saveAll(allCandidates);
            candidateRepository.flush();
        }
        jobRoleRepository.flush();

        // 3. Ensure every candidate's company & role exist in the tables
        for (Candidate c : allCandidates) {
            if (c.getCompanyName() != null && !c.getCompanyName().trim().isEmpty()) {
                String r = (c.getTargetRole() != null && !c.getTargetRole().trim().isEmpty()) ? c.getTargetRole() : "Software Engineer";
                findOrCreateCompanyAndRole(c.getCompanyName(), r);
            }
        }
    }

    public List<Map<String, Object>> getCompaniesHierarchy() {
        List<Company> companies = companyRepository.findAllByOrderByNameAsc();
        List<Map<String, Object>> result = new ArrayList<>();

        for (Company c : companies) {
            List<JobRole> roles = jobRoleRepository.findByCompanyOrderByRoleNameAsc(c);
            List<String> roleNames = new ArrayList<>();
            for (JobRole r : roles) {
                roleNames.add(r.getRoleName());
            }

            long totalCandidates = candidateRepository.countByNormalizedCompany(c.getName());

            Map<String, Object> map = new HashMap<>();
            map.put("companyId", c.getId());
            map.put("companyName", c.getName());
            map.put("roleCount", roles.size());
            map.put("candidateCount", totalCandidates);
            map.put("roles", roleNames);
            map.put("createdAt", c.getCreatedAt());
            map.put("updatedAt", c.getUpdatedAt());
            result.add(map);
        }

        return result;
    }

    public List<Map<String, Object>> getRolesByCompany(String companyName) {
        String normKey = normalizeKey(companyName);
        List<Company> allCompanies = companyRepository.findAll();
        Company company = allCompanies.stream()
                .filter(c -> normalizeKey(c.getName()).equals(normKey))
                .findFirst()
                .orElse(null);

        if (company == null) {
            return Collections.emptyList();
        }

        List<JobRole> roles = jobRoleRepository.findByCompanyOrderByRoleNameAsc(company);
        List<Map<String, Object>> result = new ArrayList<>();

        for (JobRole r : roles) {
            long count = candidateRepository.countByNormalizedCompanyAndRole(company.getName(), r.getRoleName());
            List<java.time.LocalDate> dates = candidateRepository.findDistinctDatesByCompanyAndRole(company.getName(), r.getRoleName());
            Map<String, Object> map = new HashMap<>();
            map.put("roleId", r.getId());
            map.put("roleName", r.getRoleName());
            map.put("candidateCount", count);
            map.put("dateCount", dates.size() > 0 ? dates.size() : (count > 0 ? 1 : 0));
            map.put("updatedAt", r.getUpdatedAt());
            result.add(map);
        }

        return result;
    }

    public List<Map<String, Object>> getDatesByCompanyAndRole(String companyName, String roleName) {
        List<java.time.LocalDate> dates = candidateRepository.findDistinctDatesByCompanyAndRole(companyName, roleName);
        List<Map<String, Object>> result = new ArrayList<>();
        java.time.format.DateTimeFormatter dtf = java.time.format.DateTimeFormatter.ofPattern("dd MMM yyyy");

        if (dates.isEmpty()) {
            // Check if there are candidates without explicit batchDate
            List<Candidate> cands = candidateRepository.findByNormalizedCompanyAndRole(companyName, roleName);
            if (!cands.isEmpty()) {
                dates = Collections.singletonList(java.time.LocalDate.now());
            }
        }

        for (java.time.LocalDate d : dates) {
            List<Candidate> batchCandidates = candidateRepository.findByNormalizedCompanyAndRoleAndDate(companyName, roleName, d);
            long total = batchCandidates.size();
            long completed = batchCandidates.stream().filter(c -> "COMPLETED".equalsIgnoreCase(c.getStatus().name())).count();
            
            Double avgScore = batchCandidates.stream()
                    .mapToDouble(c -> c.getOverallScore() != null ? c.getOverallScore() : (c.getResumeScore() != null ? c.getResumeScore() : 0.0))
                    .average()
                    .orElse(0.0);

            LocalDateTime expiry = batchCandidates.stream()
                    .map(Candidate::getExpiryDate)
                    .filter(Objects::nonNull)
                    .findFirst()
                    .orElse(null);

            Map<String, Object> map = new HashMap<>();
            map.put("date", d.toString());
            map.put("formattedDate", d.format(dtf));
            map.put("candidateCount", total);
            map.put("completedCount", completed);
            map.put("avgScore", Math.round(avgScore * 10.0) / 10.0);
            map.put("expiryDate", expiry);
            result.add(map);
        }

        return result;
    }

    public List<com.airesume.model.LeaderboardEntryDto> getDateCohortLeaderboard(String companyName, String roleName, String dateStr) {
        java.time.LocalDate date = null;
        try {
            date = java.time.LocalDate.parse(dateStr);
        } catch (Exception ignore) {}

        List<Candidate> candidates;
        if (date != null) {
            candidates = candidateRepository.findByNormalizedCompanyAndRoleAndDate(companyName, roleName, date);
        } else {
            candidates = candidateRepository.findByNormalizedCompanyAndRole(companyName, roleName);
        }

        List<com.airesume.model.LeaderboardEntryDto> list = new ArrayList<>();
        int rank = 1;
        for (Candidate c : candidates) {
            double resScore = c.getResumeScore() != null ? c.getResumeScore() : 0.0;
            Double assessScore = c.getAssessmentScore();
            Double overall = (assessScore != null || c.getStatus() == com.airesume.model.CandidateStatus.COMPLETED || c.getStatus() == com.airesume.model.CandidateStatus.DISQUALIFIED)
                    ? c.getOverallScore()
                    : null;

            list.add(com.airesume.model.LeaderboardEntryDto.builder()
                    .rank(rank++)
                    .candidateId(c.getId())
                    .name(c.getName())
                    .email(c.getEmail())
                    .companyName(c.getCompanyName())
                    .targetRole(c.getTargetRole())
                    .expiryDate(c.getExpiryDate())
                    .resumeScore(resScore)
                    .assessmentScore(assessScore)
                    .overallScore(overall)
                    .status(c.getStatus().name())
                    .resumeViewUrl("/api/resumes/" + c.getId() + "/pdf")
                    .createdAt(c.getCreatedAt())
                    .completedAt(c.getCompletedAt())
                    .build());
        }
        return list;
    }

    public List<com.airesume.model.LeaderboardEntryDto> getRoleCohortLeaderboard(String companyName, String roleName) {
        List<Candidate> candidates;
        if ("ALL".equalsIgnoreCase(roleName)) {
            candidates = candidateRepository.findByNormalizedCompany(companyName);
        } else {
            candidates = candidateRepository.findByNormalizedCompanyAndRole(companyName, roleName);
        }

        List<com.airesume.model.LeaderboardEntryDto> list = new ArrayList<>();
        int rank = 1;
        for (Candidate c : candidates) {
            double resScore = c.getResumeScore() != null ? c.getResumeScore() : 0.0;
            Double assessScore = c.getAssessmentScore();
            Double overall = (assessScore != null || c.getStatus() == com.airesume.model.CandidateStatus.COMPLETED || c.getStatus() == com.airesume.model.CandidateStatus.DISQUALIFIED)
                    ? c.getOverallScore()
                    : null;

            list.add(com.airesume.model.LeaderboardEntryDto.builder()
                    .rank(rank++)
                    .candidateId(c.getId())
                    .name(c.getName())
                    .email(c.getEmail())
                    .companyName(c.getCompanyName())
                    .targetRole(c.getTargetRole())
                    .expiryDate(c.getExpiryDate())
                    .resumeScore(resScore)
                    .assessmentScore(assessScore)
                    .overallScore(overall)
                    .status(c.getStatus().name())
                    .resumeViewUrl("/api/resumes/" + c.getId() + "/pdf")
                    .createdAt(c.getCreatedAt())
                    .completedAt(c.getCompletedAt())
                    .build());
        }
        return list;
    }
}