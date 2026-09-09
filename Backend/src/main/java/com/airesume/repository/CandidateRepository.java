package com.airesume.repository;

import com.airesume.model.Candidate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CandidateRepository extends JpaRepository<Candidate, Long> {
    Optional<Candidate> findByToken(String token);

    @Query("SELECT c FROM Candidate c WHERE LOWER(c.email) = LOWER(:email) ORDER BY c.createdAt DESC")
    List<Candidate> findByEmailIgnoreCaseOrderByCreatedAtDesc(@Param("email") String email);

    @Query("SELECT c FROM Candidate c WHERE LOWER(c.name) = LOWER(:name) ORDER BY c.createdAt DESC")
    List<Candidate> findByNameIgnoreCaseOrderByCreatedAtDesc(@Param("name") String name);

    @Query("SELECT c FROM Candidate c WHERE LOWER(c.email) = LOWER(:email) OR LOWER(c.name) = LOWER(:name) ORDER BY c.createdAt DESC")
    List<Candidate> findByEmailOrNameIgnoreCase(@Param("email") String email, @Param("name") String name);

    @Query("SELECT c FROM Candidate c ORDER BY CASE WHEN c.overallScore IS NOT NULL THEN 0 ELSE 1 END ASC, c.overallScore DESC, c.resumeScore DESC, c.createdAt DESC")
    List<Candidate> findAllOrderByOverallScoreDesc();

    @Query("SELECT DISTINCT c.companyName FROM Candidate c WHERE c.companyName IS NOT NULL AND TRIM(c.companyName) <> '' ORDER BY c.companyName ASC")
    List<String> findDistinctCompanies();

    @Query("SELECT DISTINCT c.targetRole FROM Candidate c WHERE LOWER(c.companyName) = LOWER(:companyName) AND c.targetRole IS NOT NULL AND TRIM(c.targetRole) <> '' ORDER BY c.targetRole ASC")
    List<String> findDistinctRolesByCompany(@Param("companyName") String companyName);

    @Query("SELECT c FROM Candidate c WHERE c.companyName IS NOT NULL AND REPLACE(LOWER(c.companyName), ' ', '') = REPLACE(LOWER(:companyName), ' ', '') AND c.targetRole IS NOT NULL AND REPLACE(LOWER(c.targetRole), ' ', '') = REPLACE(LOWER(:targetRole), ' ', '') ORDER BY CASE WHEN c.overallScore IS NOT NULL THEN 0 ELSE 1 END ASC, c.overallScore DESC, c.resumeScore DESC, c.createdAt DESC")
    List<Candidate> findByNormalizedCompanyAndRole(@Param("companyName") String companyName, @Param("targetRole") String targetRole);

    @Query("SELECT c FROM Candidate c WHERE c.companyName IS NOT NULL AND REPLACE(LOWER(c.companyName), ' ', '') = REPLACE(LOWER(:companyName), ' ', '') ORDER BY CASE WHEN c.overallScore IS NOT NULL THEN 0 ELSE 1 END ASC, c.overallScore DESC, c.resumeScore DESC, c.createdAt DESC")
    List<Candidate> findByNormalizedCompany(@Param("companyName") String companyName);

    @Query("SELECT COUNT(c) FROM Candidate c WHERE c.companyName IS NOT NULL AND REPLACE(LOWER(c.companyName), ' ', '') = REPLACE(LOWER(:companyName), ' ', '')")
    long countByNormalizedCompany(@Param("companyName") String companyName);

    @Query("SELECT COUNT(c) FROM Candidate c WHERE c.companyName IS NOT NULL AND REPLACE(LOWER(c.companyName), ' ', '') = REPLACE(LOWER(:companyName), ' ', '') AND c.targetRole IS NOT NULL AND REPLACE(LOWER(c.targetRole), ' ', '') = REPLACE(LOWER(:targetRole), ' ', '')")
    long countByNormalizedCompanyAndRole(@Param("companyName") String companyName, @Param("targetRole") String targetRole);

    @Query("SELECT c FROM Candidate c WHERE LOWER(c.companyName) = LOWER(:companyName) AND LOWER(c.targetRole) = LOWER(:targetRole) ORDER BY CASE WHEN c.overallScore IS NOT NULL THEN 0 ELSE 1 END ASC, c.overallScore DESC, c.resumeScore DESC, c.createdAt DESC")
    List<Candidate> findByCompanyNameAndTargetRole(@Param("companyName") String companyName, @Param("targetRole") String targetRole);

    @Query("SELECT c FROM Candidate c WHERE LOWER(c.companyName) = LOWER(:companyName) ORDER BY CASE WHEN c.overallScore IS NOT NULL THEN 0 ELSE 1 END ASC, c.overallScore DESC, c.resumeScore DESC, c.createdAt DESC")
    List<Candidate> findByCompanyName(@Param("companyName") String companyName);

    @Query("SELECT DISTINCT c.batchDate FROM Candidate c WHERE c.companyName IS NOT NULL AND REPLACE(LOWER(c.companyName), ' ', '') = REPLACE(LOWER(:companyName), ' ', '') AND c.targetRole IS NOT NULL AND REPLACE(LOWER(c.targetRole), ' ', '') = REPLACE(LOWER(:targetRole), ' ', '') AND c.batchDate IS NOT NULL ORDER BY c.batchDate DESC")
    List<java.time.LocalDate> findDistinctDatesByCompanyAndRole(@Param("companyName") String companyName, @Param("targetRole") String targetRole);

    @Query("SELECT c FROM Candidate c WHERE c.companyName IS NOT NULL AND REPLACE(LOWER(c.companyName), ' ', '') = REPLACE(LOWER(:companyName), ' ', '') AND c.targetRole IS NOT NULL AND REPLACE(LOWER(c.targetRole), ' ', '') = REPLACE(LOWER(:targetRole), ' ', '') AND c.batchDate = :batchDate ORDER BY CASE WHEN c.overallScore IS NOT NULL THEN 0 ELSE 1 END ASC, c.overallScore DESC, c.resumeScore DESC, c.createdAt DESC")
    List<Candidate> findByNormalizedCompanyAndRoleAndDate(@Param("companyName") String companyName, @Param("targetRole") String targetRole, @Param("batchDate") java.time.LocalDate batchDate);

    @Query("SELECT COUNT(c) FROM Candidate c WHERE c.companyName IS NOT NULL AND REPLACE(LOWER(c.companyName), ' ', '') = REPLACE(LOWER(:companyName), ' ', '') AND c.targetRole IS NOT NULL AND REPLACE(LOWER(c.targetRole), ' ', '') = REPLACE(LOWER(:targetRole), ' ', '') AND c.batchDate = :batchDate")
    long countByNormalizedCompanyAndRoleAndDate(@Param("companyName") String companyName, @Param("targetRole") String targetRole, @Param("batchDate") java.time.LocalDate batchDate);

    long countByCompanyName(String companyName);

    long countByCompanyNameAndTargetRole(String companyName, String targetRole);
}
