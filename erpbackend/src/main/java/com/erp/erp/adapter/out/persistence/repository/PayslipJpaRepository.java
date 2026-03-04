package com.erp.erp.adapter.out.persistence.repository;

import com.erp.erp.adapter.out.persistence.entity.PayslipJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PayslipJpaRepository extends JpaRepository<PayslipJpaEntity, Long> {
    List<PayslipJpaEntity> findByEmployeIdOrderByAnneeDescMoisDesc(Long employeId);
}
