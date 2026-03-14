package com.erp.erp.domain.port.in.department;

import com.erp.erp.domain.model.Department;

public interface CreateDepartmentUseCase {
    Department create(Department department);
}
