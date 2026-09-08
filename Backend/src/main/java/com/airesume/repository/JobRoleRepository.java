package com.airesume.repository;

import com.airesume.model.Company;
import com.airesume.model.JobRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface JobRoleRepository extends JpaRepository<JobRole, Long> {
    Optional<JobRole> findByCompanyAndRoleNameIgnoreCase(Company company, String roleName);
    List<JobRole> findByCompanyOrderByRoleNameAsc(Company company);
    List<JobRole> findByCompany_NameIgnoreCaseOrderByRoleNameAsc(String companyName);
}