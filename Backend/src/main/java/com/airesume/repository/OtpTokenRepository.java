package com.airesume.repository;

import com.airesume.model.OtpToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface OtpTokenRepository extends JpaRepository<OtpToken, Long> {

    @Query("SELECT o FROM OtpToken o WHERE LOWER(o.email) = LOWER(:email) AND o.otpCode = :otpCode AND o.isVerified = false ORDER BY o.createdAt DESC")
    List<OtpToken> findPendingOtpList(@Param("email") String email, @Param("otpCode") String otpCode);

    @Query("SELECT o FROM OtpToken o WHERE LOWER(o.email) = LOWER(:email) AND o.isVerified = true ORDER BY o.createdAt DESC")
    List<OtpToken> findVerifiedOtpList(@Param("email") String email);

    @Transactional
    @Modifying
    @Query("DELETE FROM OtpToken o WHERE LOWER(o.email) = LOWER(:email)")
    void deleteByEmailIgnoreCase(@Param("email") String email);

    default Optional<OtpToken> findTopByEmailIgnoreCaseAndOtpCodeAndIsVerifiedFalseOrderByCreatedAtDesc(String email, String otpCode) {
        List<OtpToken> list = findPendingOtpList(email, otpCode);
        return list.isEmpty() ? Optional.empty() : Optional.of(list.get(0));
    }

    default Optional<OtpToken> findTopByEmailIgnoreCaseAndIsVerifiedTrueOrderByCreatedAtDesc(String email) {
        List<OtpToken> list = findVerifiedOtpList(email);
        return list.isEmpty() ? Optional.empty() : Optional.of(list.get(0));
    }
}
