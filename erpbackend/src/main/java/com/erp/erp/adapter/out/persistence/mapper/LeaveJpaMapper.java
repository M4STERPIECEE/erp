package com.erp.erp.adapter.out.persistence.mapper;

import com.erp.erp.adapter.out.persistence.entity.LeaveJpaEntity;
import com.erp.erp.domain.model.Leave;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface LeaveJpaMapper {

    @Mapping(target = "type", expression = "java(entity.getType() != null ? com.erp.erp.domain.model.enums.LeaveType.valueOf(entity.getType()) : null)")
    @Mapping(target = "statut", expression = "java(entity.getStatut() != null ? com.erp.erp.domain.model.enums.LeaveStatus.valueOf(entity.getStatut()) : null)")
    Leave toDomain(LeaveJpaEntity entity);

    @Mapping(target = "type", expression = "java(leave.getType() != null ? leave.getType().name() : null)")
    @Mapping(target = "statut", expression = "java(leave.getStatut() != null ? leave.getStatut().name() : null)")
    @Mapping(target = "updatedAt", ignore = true)
    LeaveJpaEntity toEntity(Leave leave);
}
