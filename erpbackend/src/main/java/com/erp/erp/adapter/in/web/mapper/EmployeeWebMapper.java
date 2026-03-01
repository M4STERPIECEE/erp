package com.erp.erp.adapter.in.web.mapper;

import com.erp.erp.adapter.in.web.dto.request.CreateEmployeeRequest;
import com.erp.erp.adapter.in.web.dto.response.EmployeeResponse;
import com.erp.erp.adapter.in.web.dto.response.PagedEmployeeResponse;
import com.erp.erp.application.command.CreateEmployeCommand;
import com.erp.erp.application.result.EmployeListResult;
import com.erp.erp.application.result.EmployeResult;
import com.erp.erp.domain.model.PageResult;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface EmployeeWebMapper {
    CreateEmployeCommand toCommand(CreateEmployeeRequest request);
    EmployeeResponse toResponse(EmployeResult result);
    EmployeeResponse toResponseFromList(EmployeListResult result);

    default PagedEmployeeResponse toPagedResponse(PageResult<EmployeListResult> page) {
        List<EmployeeResponse> content = page.content().stream()
                .map(this::toResponseFromList)
                .toList();
        return new PagedEmployeeResponse(content, page.totalElements(), page.totalPages(), page.number(), page.size());
    }
}
