package com.erp.erp.domain.port.in.employe;

import com.erp.erp.application.result.EmployeListResult;
import com.erp.erp.domain.model.PageResult;

public interface ListEmployesUseCase {
    PageResult<EmployeListResult> lister(String search, Long departementId, String statut, int page, int size);
}
