package com.erp.erp.domain.port.in.employe;

import com.erp.erp.application.command.CreateEmployeCommand;
import com.erp.erp.application.result.EmployeResult;

public interface CreateEmployeUseCase {
    EmployeResult creer(CreateEmployeCommand command);
}
