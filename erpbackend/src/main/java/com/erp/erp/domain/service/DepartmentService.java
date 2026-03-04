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

    public List<Department> listerTous() {
        List<Department> departements = repository.findAll();
        for (Department d : departements) {
            d.setNombreEmployes(repository.countEmployesByDepartementId(d.getId()));
            if (d.getResponsableId() != null) {
                repository.findResponsableNomById(d.getResponsableId())
                        .ifPresent(d::setResponsableNom);
            }
        }
        return departements;
    }

    public Optional<Department> trouverParId(Long id) {
        return repository.findById(id).map(d -> {
            d.setNombreEmployes(repository.countEmployesByDepartementId(d.getId()));
            if (d.getResponsableId() != null) {
                repository.findResponsableNomById(d.getResponsableId())
                        .ifPresent(d::setResponsableNom);
            }
            return d;
        });
    }

    public Department creer(Department department) {
        Department saved = repository.save(department);
        return enrichir(saved);
    }

    public Department modifier(Long id, String nom, String description, Long responsableId) {
        Department existing = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Département introuvable : " + id));
        existing.setNom(nom);
        existing.setDescription(description);
        existing.setResponsableId(responsableId);
        Department saved = repository.save(existing);
        return enrichir(saved);
    }

    public void supprimer(Long id) {
        repository.deleteById(id);
    }

    private Department enrichir(Department d) {
        d.setNombreEmployes(repository.countEmployesByDepartementId(d.getId()));
        if (d.getResponsableId() != null) {
            repository.findResponsableNomById(d.getResponsableId())
                    .ifPresent(d::setResponsableNom);
        }
        return d;
    }
}
