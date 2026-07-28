package com.erp.erp.adapter.in.web.mapper;

import com.erp.erp.adapter.in.web.dto.request.CreateEmployeeRequest;
import com.erp.erp.adapter.in.web.dto.response.EmployeeResponse;
import com.erp.erp.adapter.in.web.dto.response.EmployeeStatsResponse;
import com.erp.erp.adapter.in.web.dto.response.PagedEmployeeResponse;
import com.erp.erp.adapter.in.web.dto.response.ProfileResponse;
import com.erp.erp.application.command.CreateEmployeeCommand;
import com.erp.erp.application.result.EmployeeListResult;
import com.erp.erp.application.result.EmployeeResult;
import com.erp.erp.domain.model.Employee;
import com.erp.erp.domain.model.PageResult;
import com.erp.erp.domain.model.enums.ContractType;
import com.erp.erp.domain.port.out.EmployeeRepositoryPort.ContractInfo;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

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
    ProfileResponse toProfileResponse(Employee employee, ContractInfo contract, String departementNom);

    default EmployeeListResult toEmployeeListResult(Employee employee, ContractInfo contract) {
        return new EmployeeListResult(
                employee.getId(), employee.getMatricule(), employee.getNom(),
                employee.getPrenom(), employee.getEmail(), employee.getTelephone(),
                employee.getDateNaissance(), employee.getDateEmbauche(), employee.getPoste(),
                employee.getStatut() != null ? employee.getStatut().name() : null,
                employee.getDepartementId(),
                contract != null ? contract.type() : null,
                contract != null ? contract.salaireBase() : null
        );
    }

    default EmployeeResponse toEmployeeResponse(Employee employee, ContractInfo contract) {
        return toResponseFromList(toEmployeeListResult(employee, contract));
    }

    default EmployeeStatsResponse toStatsResponse(long total, Map<ContractType, Long> distribution) {
        Map<String, Long> converted = distribution.entrySet().stream()
                .collect(Collectors.toMap(e -> e.getKey().name(), Map.Entry::getValue));
        return new EmployeeStatsResponse(total, converted);
    }
}