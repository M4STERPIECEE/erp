package com.erp.erp.domain.port.in.department;

import com.erp.erp.domain.model.Department;

public interface UpdateDepartmentUseCase {
    Department update(Long id, String nom, String description, Long responsableId);
    void delete(Long id);
}
