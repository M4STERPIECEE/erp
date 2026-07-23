package com.erp.erp.adapter.out.persistence.adapter;

import com.erp.erp.adapter.out.persistence.entity.DepartmentJpaEntity;
import com.erp.erp.adapter.out.persistence.mapper.DepartmentJpaMapper;
import com.erp.erp.adapter.out.persistence.repository.DepartmentJpaRepository;
import com.erp.erp.domain.model.Department;
import com.erp.erp.domain.port.out.DepartmentRepositoryPort;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
public class DepartmentPersistenceAdapter implements DepartmentRepositoryPort {

    private final DepartmentJpaRepository jpaRepository;
    private final DepartmentJpaMapper mapper;

    public DepartmentPersistenceAdapter(DepartmentJpaRepository jpaRepository, DepartmentJpaMapper mapper) {
        this.jpaRepository = jpaRepository;
        this.mapper = mapper;
    }

    @Override
    public List<Department> findAll() {
        return jpaRepository.findAll().stream().map(mapper::toDomain).toList();
    }

    @Override
    public Optional<Department> findById(Long id) {
        return jpaRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    public Department save(Department department) {
        DepartmentJpaEntity entity = mapper.toEntity(department);
        DepartmentJpaEntity saved = jpaRepository.save(entity);
        return mapper.toDomain(saved);
    }

    @Override
    public void deleteById(Long id) {
        jpaRepository.deleteById(id);
    }

    @Override
    public List<Department> findAllWithStats() {
        return jpaRepository.findAllWithStats().stream()
                .map(this::rowToDomain)
                .toList();
    }

    @Override
    public Optional<Department> findByIdWithStats(Long id) {
        return jpaRepository.findByIdWithStats(id).stream()
                .map(this::rowToDomain)
                .findFirst();
    }

    private Department rowToDomain(Object[] row) {
        DepartmentJpaEntity entity = (DepartmentJpaEntity) row[0];
        long nombreEmployes = ((Number) row[1]).longValue();
        String responsableNom = (String) row[2];
        Department d = mapper.toDomain(entity);
        d.setNombreEmployes(nombreEmployes);
        d.setResponsableNom(responsableNom);
        return d;
    }
}
