package com.erp.erp.adapter.out.persistence.adapter;

import com.erp.erp.adapter.out.persistence.entity.DepartementJpaEntity;
import com.erp.erp.adapter.out.persistence.repository.DepartementJpaRepository;
import com.erp.erp.domain.model.Departement;
import com.erp.erp.domain.port.out.DepartementRepositoryPort;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
public class DepartementPersistenceAdapter implements DepartementRepositoryPort {

    private final DepartementJpaRepository jpaRepository;

    public DepartementPersistenceAdapter(DepartementJpaRepository jpaRepository) {
        this.jpaRepository = jpaRepository;
    }

    @Override
    public List<Departement> findAll() {
        return jpaRepository.findAll().stream().map(this::toDomain).toList();
    }

    @Override
    public Optional<Departement> findById(Long id) {
        return jpaRepository.findById(id).map(this::toDomain);
    }

    @Override
    public Departement save(Departement departement) {
        DepartementJpaEntity entity = toEntity(departement);
        DepartementJpaEntity saved = jpaRepository.save(entity);
        return toDomain(saved);
    }

    @Override
    public void deleteById(Long id) {
        jpaRepository.deleteById(id);
    }

    @Override
    public long countEmployesByDepartementId(Long departementId) {
        return jpaRepository.countEmployesByDepartementId(departementId);
    }

    @Override
    public Optional<String> findResponsableNomById(Long responsableId) {
        return jpaRepository.findEmployeNomCompletById(responsableId);
    }

    private Departement toDomain(DepartementJpaEntity entity) {
        Departement d = new Departement();
        d.setId(entity.getId());
        d.setNom(entity.getNom());
        d.setDescription(entity.getDescription());
        d.setResponsableId(entity.getResponsableId());
        d.setCreatedAt(entity.getCreatedAt());
        d.setUpdatedAt(entity.getUpdatedAt());
        return d;
    }

    private DepartementJpaEntity toEntity(Departement domain) {
        DepartementJpaEntity entity = new DepartementJpaEntity();
        entity.setId(domain.getId());
        entity.setNom(domain.getNom());
        entity.setDescription(domain.getDescription());
        entity.setResponsableId(domain.getResponsableId());
        return entity;
    }
}
