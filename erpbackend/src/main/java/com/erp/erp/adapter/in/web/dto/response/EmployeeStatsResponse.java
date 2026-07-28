package com.erp.erp.adapter.in.web.dto.response;

import java.util.Map;

public record EmployeeStatsResponse(
        long totalEmployees,
        Map<String, Long> contractDistribution
) {}