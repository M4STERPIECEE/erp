package com.erp.erp.domain.port.in.department;

import com.erp.erp.domain.model.Department;

import java.util.List;
import java.util.Optional;

public interface GetDepartmentUseCase {
    List<Department> listAll();
    Optional<Department> findById(Long id);
}
