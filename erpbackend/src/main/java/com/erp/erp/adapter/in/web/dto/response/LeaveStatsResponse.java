package com.erp.erp.adapter.in.web.dto.response;

public record LeaveStatsResponse(
        int daysTaken,
        int pending,
        int remainingBalance
) {}