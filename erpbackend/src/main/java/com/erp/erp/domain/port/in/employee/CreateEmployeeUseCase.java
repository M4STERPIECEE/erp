package com.erp.erp.domain.port.in.employee;

import com.erp.erp.application.command.CreateEmployeeCommand;
import com.erp.erp.application.result.EmployeeResult;

public interface CreateEmployeeUseCase {
    EmployeeResult creer(CreateEmployeeCommand command);
}
