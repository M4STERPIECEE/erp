package com.erp.erp.domain.service;

import com.erp.erp.domain.model.Department;
import com.erp.erp.domain.port.in.department.CreateDepartmentUseCase;
import com.erp.erp.domain.port.in.department.GetDepartmentUseCase;
import com.erp.erp.domain.port.in.department.UpdateDepartmentUseCase;
import com.erp.erp.domain.port.out.DepartmentRepositoryPort;

import java.util.List;
import java.util.Optional;

public class DepartmentService implements GetDepartmentUseCase, CreateDepartmentUseCase, UpdateDepartmentUseCase {

    private final DepartmentRepositoryPort repository;

    public DepartmentService(DepartmentRepositoryPort repository) {
        this.repository = repository;
    }

    @Override
    public List<Department> listAll() {
        return repository.findAllWithStats();
    }

    @Override
    public Optional<Department> findById(Long id) {
        return repository.findByIdWithStats(id);
    }

    @Override
    public Department create(Department department) {
        Department saved = repository.save(department);
        return repository.findByIdWithStats(saved.getId()).orElse(saved);
    }

    @Override
    public Department update(Long id, String nom, String description, Long responsableId) {
        Department existing = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Département introuvable : " + id));
        existing.setNom(nom);
        existing.setDescription(description);
        existing.setResponsableId(responsableId);
        Department saved = repository.save(existing);
        return repository.findByIdWithStats(saved.getId()).orElse(saved);
    }

    @Override
    public void delete(Long id) {
        repository.deleteById(id);
    }
}
