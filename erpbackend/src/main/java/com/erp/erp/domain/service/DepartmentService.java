package com.erp.erp.domain.service;

import com.erp.erp.domain.model.Department;
import com.erp.erp.domain.port.out.DepartmentRepositoryPort;

import java.util.List;
import java.util.Optional;

public class DepartmentService {

    private final DepartmentRepositoryPort repository;

    public DepartmentService(DepartmentRepositoryPort repository) {
        this.repository = repository;
    }

    public List<Department> listAll() {
        List<Department> departements = repository.findAll();
        for (Department d : departements) {
            d.setNombreEmployes(repository.countEmployeesByDepartmentId(d.getId()));
            if (d.getResponsableId() != null) {
                repository.findManagerNameById(d.getResponsableId())
                        .ifPresent(d::setResponsableNom);
            }
        }
        return departements;
    }

    public Optional<Department> findById(Long id) {
        return repository.findById(id).map(d -> {
            d.setNombreEmployes(repository.countEmployeesByDepartmentId(d.getId()));
            if (d.getResponsableId() != null) {
                repository.findManagerNameById(d.getResponsableId())
                        .ifPresent(d::setResponsableNom);
            }
            return d;
        });
    }

    public Department create(Department department) {
        Department saved = repository.save(department);
        return enrich(saved);
    }

    public Department update(Long id, String nom, String description, Long responsableId) {
        Department existing = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Département introuvable : " + id));
        existing.setNom(nom);
        existing.setDescription(description);
        existing.setResponsableId(responsableId);
        Department saved = repository.save(existing);
        return enrich(saved);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }

    private Department enrich(Department d) {
        d.setNombreEmployes(repository.countEmployeesByDepartmentId(d.getId()));
        if (d.getResponsableId() != null) {
            repository.findManagerNameById(d.getResponsableId())
                    .ifPresent(d::setResponsableNom);
        }
        return d;
    }
}
