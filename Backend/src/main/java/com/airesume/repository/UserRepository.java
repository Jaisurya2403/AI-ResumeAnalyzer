package com.airesume.repository;

import com.airesume.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    @Query("SELECT u FROM User u WHERE LOWER(u.email) = LOWER(:email)")
    List<User> findUsersByEmailIgnoreCase(@Param("email") String email);

    @Query("SELECT COUNT(u) FROM User u WHERE LOWER(u.email) = LOWER(:email)")
    long countByEmailIgnoreCase(@Param("email") String email);

    default Optional<User> findByEmailIgnoreCase(String email) {
        List<User> list = findUsersByEmailIgnoreCase(email);
        return list.isEmpty() ? Optional.empty() : Optional.of(list.get(0));
    }

    default boolean existsByEmailIgnoreCase(String email) {
        return countByEmailIgnoreCase(email) > 0;
    }
}
