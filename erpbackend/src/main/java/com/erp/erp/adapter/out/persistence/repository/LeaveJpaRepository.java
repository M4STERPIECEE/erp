package com.erp.erp.adapter.out.persistence.repository;

import com.erp.erp.adapter.out.persistence.entity.LeaveJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface LeaveJpaRepository extends JpaRepository<LeaveJpaEntity, Long> {
    List<LeaveJpaEntity> findByEmployeIdOrderByCreatedAtDesc(Long employeId);
    List<LeaveJpaEntity> findAllByOrderByCreatedAtDesc();

    @Query("SELECT COALESCE(SUM(c.nombreJours), 0) FROM LeaveJpaEntity c " +
           "WHERE c.employeId = :employeId AND c.statut = 'APPROUVE' " +
           "AND EXTRACT(YEAR FROM c.dateDebut) = :annee")
    int countApprovedDays(@Param("employeId") Long employeId, @Param("annee") int annee);

    @Query("SELECT COUNT(c) FROM LeaveJpaEntity c " +
           "WHERE c.employeId = :employeId AND c.statut = 'EN_ATTENTE'")
    int countPending(@Param("employeId") Long employeId);

    @Query("SELECT COUNT(c) FROM LeaveJpaEntity c WHERE c.statut = 'EN_ATTENTE'")
    int countAllPending();

    @Query("SELECT COUNT(c) FROM LeaveJpaEntity c WHERE c.statut = 'APPROUVE'")
    int countAllApproved();

    @Query("SELECT COUNT(c) FROM LeaveJpaEntity c " +
           "WHERE c.statut = 'APPROUVE' AND c.dateDebut <= :today AND c.dateFin >= :today")
    int countOnLeaveToday(@Param("today") LocalDate today);

    @Query("SELECT COUNT(c) FROM LeaveJpaEntity c " +
           "WHERE c.statut IN ('EN_ATTENTE', 'APPROUVE') " +
           "AND EXTRACT(YEAR FROM c.dateDebut) = :year AND EXTRACT(MONTH FROM c.dateDebut) = :month")
    int countPlannedThisMonth(@Param("year") int year, @Param("month") int month);
}
