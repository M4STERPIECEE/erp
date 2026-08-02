package com.erp.erp.adapter.in.web.exception;

public record ApiErrorResponse(
    String timestamp,
    int status,
    String error,
    String message
) {}
