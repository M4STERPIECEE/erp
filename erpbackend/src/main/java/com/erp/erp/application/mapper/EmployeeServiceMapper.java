package com.erp.erp.application.mapper;

import com.erp.erp.application.result.EmployeeListResult;
import com.erp.erp.application.result.EmployeeResult;
import com.erp.erp.domain.model.Employee;
import com.erp.erp.domain.port.out.EmployeeRepositoryPort.ContractInfo;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import java.math.BigDecimal;

@Mapper(componentModel = "spring")
public interface EmployeeServiceMapper {

    @Mapping(target = "statut", expression = "java(employee.getStatut() != null ? employee.getStatut().name() : null)")
    @Mapping(target = "contractType", source = "contractType")
    @Mapping(target = "salaireBase", source = "salaireBase")
    EmployeeResult toResult(Employee employee, String contractType, BigDecimal salaireBase);

    @Mapping(target = "statut", expression = "java(employee.getStatut() != null ? employee.getStatut().name() : null)")
    @Mapping(target = "contractType", expression = "java(contract != null ? contract.type() : null)")
    @Mapping(target = "salaireBase", expression = "java(contract != null ? contract.salaireBase() : null)")
    EmployeeListResult toListResult(Employee employee, ContractInfo contract);
}
