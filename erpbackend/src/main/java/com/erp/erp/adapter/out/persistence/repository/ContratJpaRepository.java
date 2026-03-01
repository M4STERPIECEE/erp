package com.erp.erp.adapter.out.persistence.repository;

import com.erp.erp.adapter.out.persistence.entity.ContratJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ContratJpaRepository extends JpaRepository<ContratJpaEntity, Long> {
    List<ContratJpaEntity> findByEmployeIdIn(List<Long> employeIds);
}
