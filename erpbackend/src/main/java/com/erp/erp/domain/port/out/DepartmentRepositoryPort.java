package com.erp.erp.domain.port.out;

import com.erp.erp.domain.model.Department;

import java.util.List;
import java.util.Optional;

public interface DepartmentRepositoryPort {
    List<Department> findAll();
    Optional<Department> findById(Long id);
    Department save(Department department);
    void deleteById(Long id);
    long countEmployeesByDepartmentId(Long departementId);
    Optional<String> findManagerNameById(Long responsableId);
}
