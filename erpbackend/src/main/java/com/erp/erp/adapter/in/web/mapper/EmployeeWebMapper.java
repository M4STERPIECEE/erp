package com.erp.erp.adapter.in.web.mapper;

import com.erp.erp.adapter.in.web.dto.request.CreateEmployeeRequest;
import com.erp.erp.adapter.in.web.dto.response.EmployeeResponse;
import com.erp.erp.application.command.CreateEmployeCommand;
import com.erp.erp.application.result.EmployeResult;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface EmployeeWebMapper {
    CreateEmployeCommand toCommand(CreateEmployeeRequest request);
    EmployeeResponse toResponse(EmployeResult result);
}
