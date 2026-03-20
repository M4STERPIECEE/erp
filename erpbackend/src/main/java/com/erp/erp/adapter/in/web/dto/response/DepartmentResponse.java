package com.erp.erp.adapter.in.web.dto.response;

public record DepartmentResponse(
        Long id,
        String nom,
        String description,
        Long responsableId,
        String responsableNom,
        long nombreEmployes
) {}
