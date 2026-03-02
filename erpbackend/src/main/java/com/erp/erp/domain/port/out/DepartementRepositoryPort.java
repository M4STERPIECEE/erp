package com.erp.erp.domain.port.out;

import com.erp.erp.domain.model.Departement;

import java.util.List;
import java.util.Optional;

public interface DepartementRepositoryPort {
    List<Departement> findAll();
    Optional<Departement> findById(Long id);
    Departement save(Departement departement);
    void deleteById(Long id);
    long countEmployesByDepartementId(Long departementId);
    Optional<String> findResponsableNomById(Long responsableId);
}
