package com.erp.erp.adapter.out.persistence.repository;

import com.erp.erp.adapter.out.persistence.entity.EmployeJpaEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface EmployeJpaRepository extends JpaRepository<EmployeJpaEntity, Long> {
    boolean existsByEmail(String email);

    @Query("SELECT e FROM EmployeJpaEntity e WHERE " +
           "(:search IS NULL OR :search = '' OR " +
           "LOWER(e.nom) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(e.prenom) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(e.email) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(e.matricule) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND (:departementId IS NULL OR e.departementId = :departementId) " +
           "AND (:statut IS NULL OR :statut = '' OR e.statut = :statut)")
    Page<EmployeJpaEntity> rechercher(
            @Param("search") String search,
            @Param("departementId") Long departementId,
            @Param("statut") String statut,
            Pageable pageable);
}
