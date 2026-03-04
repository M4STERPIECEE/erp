package com.erp.erp.adapter.out.persistence.repository;

import com.erp.erp.adapter.out.persistence.entity.LeaveJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LeaveJpaRepository extends JpaRepository<LeaveJpaEntity, Long> {
    List<LeaveJpaEntity> findByEmployeIdOrderByCreatedAtDesc(Long employeId);

    @Query("SELECT COALESCE(SUM(c.nombreJours), 0) FROM LeaveJpaEntity c " +
           "WHERE c.employeId = :employeId AND c.statut = 'APPROUVE' " +
           "AND EXTRACT(YEAR FROM c.dateDebut) = :annee")
    int compterJoursApprouves(@Param("employeId") Long employeId, @Param("annee") int annee);

    @Query("SELECT COUNT(c) FROM LeaveJpaEntity c " +
           "WHERE c.employeId = :employeId AND c.statut = 'EN_ATTENTE'")
    int compterEnAttente(@Param("employeId") Long employeId);
}
