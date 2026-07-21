package com.erp.erp.adapter.in.web.dto.request;

public record CreateDepartementRequest(
        String nom,
        String description,
        Long responsableId
) {}
