package com.erp.erp.adapter.in.web.dto.response;

public record AdminStatsResponse(
        long pending,
        long approved,
        long onLeaveToday,
        long plannedThisMonth
) {}