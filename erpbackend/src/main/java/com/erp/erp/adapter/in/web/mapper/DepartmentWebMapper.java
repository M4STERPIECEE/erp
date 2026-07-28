package com.erp.erp.adapter.in.web.mapper;

import com.erp.erp.adapter.in.web.dto.request.CreateDepartementRequest;
import com.erp.erp.adapter.in.web.dto.response.DepartmentResponse;
import com.erp.erp.domain.model.Department;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface DepartmentWebMapper {

    DepartmentResponse toResponse(Department department);

    Department toEntity(CreateDepartementRequest request);
}