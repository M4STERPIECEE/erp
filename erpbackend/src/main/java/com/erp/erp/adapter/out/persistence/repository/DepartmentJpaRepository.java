package com.erp.erp.adapter.out.persistence.repository;

import com.erp.erp.adapter.out.persistence.entity.DepartmentJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DepartmentJpaRepository extends JpaRepository<DepartmentJpaEntity, Long> {

       @Query("SELECT d, COUNT(e.id), " +
                     "CASE WHEN mgr.id IS NOT NULL THEN CONCAT(mgr.prenom, ' ', mgr.nom) ELSE NULL END " +
                     "FROM DepartmentJpaEntity d " +
                     "LEFT JOIN EmployeeJpaEntity e ON e.departementId = d.id " +
                     "LEFT JOIN EmployeeJpaEntity mgr ON mgr.id = d.responsableId " +
                     "GROUP BY d.id, d.nom, d.description, d.responsableId, d.createdAt, d.updatedAt, mgr.id, mgr.prenom, mgr.nom "
                     +
                     "ORDER BY d.nom")
       List<Object[]> findAllWithStats();

       @Query("SELECT d, COUNT(e.id), " +
                     "CASE WHEN mgr.id IS NOT NULL THEN CONCAT(mgr.prenom, ' ', mgr.nom) ELSE NULL END " +
                     "FROM DepartmentJpaEntity d " +
                     "LEFT JOIN EmployeeJpaEntity e ON e.departementId = d.id " +
                     "LEFT JOIN EmployeeJpaEntity mgr ON mgr.id = d.responsableId " +
                     "WHERE d.id = :id " +
                     "GROUP BY d.id, d.nom, d.description, d.responsableId, d.createdAt, d.updatedAt, mgr.id, mgr.prenom, mgr.nom")
       List<Object[]> findByIdWithStats(@Param("id") Long id);
}
