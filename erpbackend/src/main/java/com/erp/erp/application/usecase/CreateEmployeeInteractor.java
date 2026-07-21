package com.erp.erp.application.usecase;

import com.erp.erp.application.command.CreateEmployeeCommand;
import com.erp.erp.application.result.EmployeeResult;
import com.erp.erp.domain.port.in.employee.CreateEmployeeUseCase;
import com.erp.erp.domain.service.EmployeeService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class CreateEmployeeInteractor implements CreateEmployeeUseCase {

    private final EmployeeService employeeService;

    public CreateEmployeeInteractor(EmployeeService employeeService) {
        this.employeeService = employeeService;
    }

    @Override
    public EmployeeResult create(CreateEmployeeCommand command) {
        return employeeService.create(command);
    }
}
