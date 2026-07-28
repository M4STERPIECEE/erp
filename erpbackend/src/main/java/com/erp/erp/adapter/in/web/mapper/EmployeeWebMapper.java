package com.erp.erp.adapter.in.web.mapper;

import com.erp.erp.adapter.in.web.dto.request.CreateEmployeeRequest;
import com.erp.erp.adapter.in.web.dto.response.EmployeeResponse;
import com.erp.erp.adapter.in.web.dto.response.PagedEmployeeResponse;
import com.erp.erp.adapter.in.web.dto.response.ProfileResponse;
import com.erp.erp.application.command.CreateEmployeeCommand;
import com.erp.erp.application.result.EmployeeListResult;
import com.erp.erp.application.result.EmployeeResult;
import com.erp.erp.domain.model.Employee;
import com.erp.erp.domain.model.PageResult;
import com.erp.erp.domain.port.out.EmployeeRepositoryPort.ContractInfo;
import org.mapstruct.Context;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import java.util.List;

@Mapper(componentModel = "spring")
public interface EmployeeWebMapper {

    CreateEmployeeCommand toCommand(CreateEmployeeRequest request);

    EmployeeResponse toResponse(EmployeeResult result);

    EmployeeResponse toResponseFromList(EmployeeListResult result);

    default PagedEmployeeResponse toPagedResponse(PageResult<EmployeeListResult> page) {
        List<EmployeeResponse> content = page.content().stream()
                .map(this::toResponseFromList)
                .toList();
        return new PagedEmployeeResponse(content, page.totalElements(), page.totalPages(), page.number(), page.size());
    }

    @Mapping(target = "statut", expression = "java(employee.getStatut() != null ? employee.getStatut().name() : null)")
    @Mapping(target = "departement", source = "departementNom")
    @Mapping(target = "contractType", expression = "java(contract != null ? contract.type() : null)")
    @Mapping(target = "salaireBase", expression = "java(contract != null ? contract.salaireBase() : null)")
    @Mapping(target = "dateDebutContrat", expression = "java(contract != null ? contract.dateDebut() : null)")
    @Mapping(target = "dateFinContrat", expression = "java(contract != null ? contract.dateFin() : null)")
    ProfileResponse toProfileResponse(Employee employee, @Context ContractInfo contract,
            @Context String departementNom);
}