package com.erp.erp.adapter.out.persistence.mapper;

import com.erp.erp.adapter.out.persistence.entity.EmployeJpaEntity;
import com.erp.erp.domain.model.Employe;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface EmployeJpaMapper {

    @Mapping(target = "keycloakId", expression = "java(entity.getKeycloakId() != null ? java.util.UUID.fromString(entity.getKeycloakId()) : null)")
    @Mapping(target = "statut", expression = "java(entity.getStatut() != null ? com.erp.erp.domain.model.enums.StatutEmploye.valueOf(entity.getStatut()) : null)")
    Employe toDomain(EmployeJpaEntity entity);

    @Mapping(target = "keycloakId", expression = "java(employe.getKeycloakId() != null ? employe.getKeycloakId().toString() : null)")
    @Mapping(target = "statut", expression = "java(employe.getStatut() != null ? employe.getStatut().name() : null)")
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    EmployeJpaEntity toEntity(Employe employe);
}
