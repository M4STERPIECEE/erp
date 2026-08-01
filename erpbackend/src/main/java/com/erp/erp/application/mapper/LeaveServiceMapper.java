package com.erp.erp.application.mapper;

import com.erp.erp.application.result.AdminLeaveResult;
import com.erp.erp.domain.model.Employee;
import com.erp.erp.domain.model.Leave;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface LeaveServiceMapper {

    @Mapping(target = "id", source = "leave.id")
    @Mapping(target = "type", expression = "java(leave.getType() != null ? leave.getType().name() : null)")
    @Mapping(target = "statut", expression = "java(leave.getStatut() != null ? leave.getStatut().name() : null)")
    @Mapping(target = "employeNom", expression = "java(employee != null ? employee.getNom() : \"Inconnu\")")
    @Mapping(target = "employePrenom", expression = "java(employee != null ? employee.getPrenom() : \"\")")
    @Mapping(target = "employePoste", expression = "java(employee != null ? employee.getPoste() : \"\")")
    AdminLeaveResult toAdminResult(Leave leave, Employee employee);
}
