package com.erp.erp.adapter.in.web.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;

public record UpdateEmployeeRequest(
        @NotBlank String nom,
        @NotBlank String prenom,
        String telephone,
        LocalDate dateNaissance,
        @NotNull LocalDate dateEmbauche,
        @NotBlank String poste,
        String statut,
        Long departementId,
        String contractType,
        @Positive BigDecimal salaireBase,
        LocalDate dateFinContrat
) {}
