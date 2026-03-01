package com.erp.erp.domain.model;

import java.util.List;

public record PageResult<T>(
        List<T> content,
        long totalElements,
        int totalPages,
        int number,
        int size
) {}
