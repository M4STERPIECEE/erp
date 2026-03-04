package com.erp.erp.domain.port.in.employee;

import com.erp.erp.application.result.EmployeeListResult;
import com.erp.erp.domain.model.PageResult;

public interface ListEmployeesUseCase {
    PageResult<EmployeeListResult> lister(String search, Long departementId, String statut, int page, int size);
}
