package com.erp.erp.domain.port.in.employee;

import com.erp.erp.domain.port.out.EmployeeRepositoryPort.ContractInfo;

import java.util.Optional;

public interface GetEmployeeContractUseCase {
    Optional<ContractInfo> findContractByEmployeeId(Long employeeId);
}
