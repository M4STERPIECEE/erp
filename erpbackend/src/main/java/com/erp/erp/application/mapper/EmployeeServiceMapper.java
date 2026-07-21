package com.erp.erp.application.mapper;

import com.erp.erp.application.result.EmployeeListResult;
import com.erp.erp.application.result.EmployeeResult;
import com.erp.erp.domain.model.Employee;
import com.erp.erp.domain.port.out.EmployeeRepositoryPort.ContractInfo;

import java.math.BigDecimal;

public class EmployeeServiceMapper {

    public EmployeeResult toResult(Employee employee, String contractType, BigDecimal salaireBase) {
        return new EmployeeResult(
                employee.getId(),
                employee.getMatricule(),
                employee.getNom(),
                employee.getPrenom(),
                employee.getEmail(),
                employee.getTelephone(),
                employee.getDateNaissance(),
                employee.getDateEmbauche(),
                employee.getPoste(),
                employee.getStatut().name(),
                employee.getDepartementId(),
                contractType,
                salaireBase);
    }

    public EmployeeListResult toListResult(Employee employee, ContractInfo contract) {
        return new EmployeeListResult(
                employee.getId(),
                employee.getMatricule(),
                employee.getNom(),
                employee.getPrenom(),
                employee.getEmail(),
                employee.getTelephone(),
                employee.getDateNaissance(),
                employee.getDateEmbauche(),
                employee.getPoste(),
                employee.getStatut() != null ? employee.getStatut().name() : null,
                employee.getDepartementId(),
                contract != null ? contract.type() : null,
                contract != null ? contract.salaireBase() : null);
    }
}
