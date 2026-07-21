package com.erp.erp.domain.port.in.employee;

import com.erp.erp.domain.model.Employee;

import java.util.Optional;

public interface GetEmployeeByEmailUseCase {
    Optional<Employee> findByEmail(String email);
}
