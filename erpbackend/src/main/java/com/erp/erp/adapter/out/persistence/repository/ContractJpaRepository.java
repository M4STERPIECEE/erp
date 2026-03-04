package com.erp.erp.adapter.out.persistence.repository;

import com.erp.erp.adapter.out.persistence.entity.ContractJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ContractJpaRepository extends JpaRepository<ContractJpaEntity, Long> {
    List<ContractJpaEntity> findByEmployeIdIn(List<Long> employeIds);
}
