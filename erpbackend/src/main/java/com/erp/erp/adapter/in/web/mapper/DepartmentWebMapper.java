package com.erp.erp.adapter.in.web.mapper;

import com.erp.erp.adapter.in.web.dto.request.CreateDepartementRequest;
import com.erp.erp.adapter.in.web.dto.response.DepartmentResponse;
import com.erp.erp.domain.model.Department;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface DepartmentWebMapper {

    DepartmentResponse toResponse(Department department);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "responsableNom", ignore = true)
    @Mapping(target = "nombreEmployes", ignore = true)
    Department toEntity(CreateDepartementRequest request);
}