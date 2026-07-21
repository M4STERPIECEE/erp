package com.erp.erp.domain.port.in.employee;

import com.erp.erp.domain.model.enums.ContractType;

import java.util.Map;

public interface GetEmployeeStatsUseCase {
    Map<ContractType, Long> countByContractType();
}
