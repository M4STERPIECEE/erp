package com.erp.erp.adapter.out.persistence.repository;

import com.erp.erp.adapter.out.persistence.entity.AbsenceJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AbsenceJpaRepository extends JpaRepository<AbsenceJpaEntity, Long> {
    @Query("SELECT a FROM AbsenceJpaEntity a " +
           "WHERE a.employeId = :employeId " +
           "AND EXTRACT(MONTH FROM a.date) = :mois " +
           "AND EXTRACT(YEAR FROM a.date) = :annee " +
           "ORDER BY a.date DESC")
    List<AbsenceJpaEntity> findByEmployeIdAndMois(
            @Param("employeId") Long employeId,
            @Param("mois") int mois,
            @Param("annee") int annee);

    @Query("SELECT COUNT(a) FROM AbsenceJpaEntity a " +
           "WHERE a.employeId = :employeId " +
           "AND EXTRACT(MONTH FROM a.date) = :mois " +
           "AND EXTRACT(YEAR FROM a.date) = :annee")
    int compterAbsences(@Param("employeId") Long employeId,
                        @Param("mois") int mois,
                        @Param("annee") int annee);
}
