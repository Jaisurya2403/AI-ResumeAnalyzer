package com.airesume.repository;

import com.airesume.model.Candidate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CandidateRepository extends JpaRepository<Candidate, Long> {
    Optional<Candidate> findByToken(String token);
    Optional<Candidate> findByEmail(String email);

    @Query("SELECT c FROM Candidate c ORDER BY COALESCE(c.overallScore, c.resumeScore, 0.0) DESC, c.createdAt DESC")
    List<Candidate> findAllOrderByOverallScoreDesc();
}
