package com.erp.erp.application.command;

import java.math.BigDecimal;
import java.time.LocalDate;

public record CreateEmployeCommand(
        String nom,
        String prenom,
        String email,
        String telephone,
        LocalDate dateNaissance,
        LocalDate dateEmbauche,
        String poste,
        Long departementId,
        String typeContrat,
        BigDecimal salaireBase,
        String role
) {}
