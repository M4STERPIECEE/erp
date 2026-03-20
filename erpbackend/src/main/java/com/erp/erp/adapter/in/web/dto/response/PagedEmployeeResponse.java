package com.erp.erp.adapter.in.web.dto.response;

import java.util.List;

public record PagedEmployeeResponse(
        List<EmployeeResponse> content,
        long totalElements,
        int totalPages,
        int number,
        int size
) {}
