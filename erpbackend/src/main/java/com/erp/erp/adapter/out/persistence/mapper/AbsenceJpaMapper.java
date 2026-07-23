package com.erp.erp.adapter.out.persistence.mapper;

import com.erp.erp.adapter.out.persistence.entity.AbsenceJpaEntity;
import com.erp.erp.domain.model.Absence;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface AbsenceJpaMapper {

    Absence toDomain(AbsenceJpaEntity entity);

    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    AbsenceJpaEntity toEntity(Absence absence);
}
