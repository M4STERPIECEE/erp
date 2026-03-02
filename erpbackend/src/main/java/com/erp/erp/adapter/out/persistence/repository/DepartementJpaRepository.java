package com.erp.erp.adapter.out.persistence.repository;

import com.erp.erp.adapter.out.persistence.entity.DepartementJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DepartementJpaRepository extends JpaRepository<DepartementJpaEntity, Long> {

    @Query("SELECT COUNT(e) FROM EmployeJpaEntity e WHERE e.departementId = :deptId")
    long countEmployesByDepartementId(@Param("deptId") Long deptId);

    @Query("SELECT CONCAT(e.prenom, ' ', e.nom) FROM EmployeJpaEntity e WHERE e.id = :empId")
    Optional<String> findEmployeNomCompletById(@Param("empId") Long empId);
}
