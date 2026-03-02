package com.erp.erp.domain.service;

import com.erp.erp.domain.model.Departement;
import com.erp.erp.domain.port.out.DepartementRepositoryPort;

import java.util.List;
import java.util.Optional;

public class DepartementService {

    private final DepartementRepositoryPort repository;

    public DepartementService(DepartementRepositoryPort repository) {
        this.repository = repository;
    }

    public List<Departement> listerTous() {
        List<Departement> departements = repository.findAll();
        for (Departement d : departements) {
            d.setNombreEmployes(repository.countEmployesByDepartementId(d.getId()));
            if (d.getResponsableId() != null) {
                repository.findResponsableNomById(d.getResponsableId())
                        .ifPresent(d::setResponsableNom);
            }
        }
        return departements;
    }

    public Optional<Departement> trouverParId(Long id) {
        return repository.findById(id).map(d -> {
            d.setNombreEmployes(repository.countEmployesByDepartementId(d.getId()));
            if (d.getResponsableId() != null) {
                repository.findResponsableNomById(d.getResponsableId())
                        .ifPresent(d::setResponsableNom);
            }
            return d;
        });
    }

    public Departement creer(Departement departement) {
        Departement saved = repository.save(departement);
        return enrichir(saved);
    }

    public Departement modifier(Long id, String nom, String description, Long responsableId) {
        Departement existing = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Département introuvable : " + id));
        existing.setNom(nom);
        existing.setDescription(description);
        existing.setResponsableId(responsableId);
        Departement saved = repository.save(existing);
        return enrichir(saved);
    }

    public void supprimer(Long id) {
        repository.deleteById(id);
    }

    private Departement enrichir(Departement d) {
        d.setNombreEmployes(repository.countEmployesByDepartementId(d.getId()));
        if (d.getResponsableId() != null) {
            repository.findResponsableNomById(d.getResponsableId())
                    .ifPresent(d::setResponsableNom);
        }
        return d;
    }
}
