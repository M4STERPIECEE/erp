package com.erp.erp.adapter.out.persistence.adapter;

import com.erp.erp.adapter.out.persistence.entity.DepartmentJpaEntity;
import com.erp.erp.adapter.out.persistence.repository.DepartmentJpaRepository;
import com.erp.erp.domain.model.Department;
import com.erp.erp.domain.port.out.DepartmentRepositoryPort;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
public class DepartmentPersistenceAdapter implements DepartmentRepositoryPort {

    private final DepartmentJpaRepository jpaRepository;

    public DepartmentPersistenceAdapter(DepartmentJpaRepository jpaRepository) {
        this.jpaRepository = jpaRepository;
    }

    @Override
    public List<Department> findAll() {
        return jpaRepository.findAll().stream().map(this::toDomain).toList();
    }

    @Override
    public Optional<Department> findById(Long id) {
        return jpaRepository.findById(id).map(this::toDomain);
    }

    @Override
    public Department save(Department department) {
        DepartmentJpaEntity entity = toEntity(department);
        DepartmentJpaEntity saved = jpaRepository.save(entity);
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

    private Department toDomain(DepartmentJpaEntity entity) {
        Department d = new Department();
        d.setId(entity.getId());
        d.setNom(entity.getNom());
        d.setDescription(entity.getDescription());
        d.setResponsableId(entity.getResponsableId());
        d.setCreatedAt(entity.getCreatedAt());
        d.setUpdatedAt(entity.getUpdatedAt());
        return d;
    }

    private DepartmentJpaEntity toEntity(Department domain) {
        DepartmentJpaEntity entity = new DepartmentJpaEntity();
        entity.setId(domain.getId());
        entity.setNom(domain.getNom());
        entity.setDescription(domain.getDescription());
        entity.setResponsableId(domain.getResponsableId());
        return entity;
    }
}
