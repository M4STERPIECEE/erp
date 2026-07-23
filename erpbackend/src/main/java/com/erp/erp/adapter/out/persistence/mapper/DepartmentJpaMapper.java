package com.erp.erp.adapter.out.persistence.mapper;

import com.erp.erp.adapter.out.persistence.entity.DepartmentJpaEntity;
import com.erp.erp.domain.model.Department;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface DepartmentJpaMapper {

    @Mapping(target = "responsableNom", ignore = true)
    @Mapping(target = "nombreEmployes", ignore = true)
    Department toDomain(DepartmentJpaEntity entity);

    DepartmentJpaEntity toEntity(Department domain);
}
