package com.erp.erp.adapter.out.persistence.mapper;

import com.erp.erp.adapter.out.persistence.entity.EmployeeJpaEntity;
import com.erp.erp.domain.model.Employee;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface EmployeeJpaMapper {

    @Mapping(target = "keycloakId", expression = "java(entity.getKeycloakId() != null ? java.util.UUID.fromString(entity.getKeycloakId()) : null)")
    @Mapping(target = "statut", expression = "java(entity.getStatut() != null ? com.erp.erp.domain.model.enums.EmployeeStatus.valueOf(entity.getStatut()) : null)")
    Employee toDomain(EmployeeJpaEntity entity);

    @Mapping(target = "keycloakId", expression = "java(employee.getKeycloakId() != null ? employee.getKeycloakId().toString() : null)")
    @Mapping(target = "statut", expression = "java(employee.getStatut() != null ? employee.getStatut().name() : null)")
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    EmployeeJpaEntity toEntity(Employee employee);
}
