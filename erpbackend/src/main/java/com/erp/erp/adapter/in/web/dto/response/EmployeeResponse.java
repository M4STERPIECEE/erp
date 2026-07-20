package com.erp.erp.adapter.in.web.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;

public record EmployeeResponse(
        Long id,
        String matricule,
        String nom,
        String prenom,
        String email,
        String telephone,
        LocalDate dateNaissance,
        LocalDate dateEmbauche,
        String poste,
        String statut,
        Long departementId,
        String contractType,
        BigDecimal salaireBase
) {}
