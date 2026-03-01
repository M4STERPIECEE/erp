package com.erp.erp.adapter.out.persistence.repository;

import com.erp.erp.adapter.out.persistence.entity.EmployeJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EmployeJpaRepository extends JpaRepository<EmployeJpaEntity, Long> {
    boolean existsByEmail(String email);
}
