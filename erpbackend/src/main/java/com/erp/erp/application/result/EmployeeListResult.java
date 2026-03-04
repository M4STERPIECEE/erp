package com.erp.erp.application.result;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record EmployeeListResult(
        Long id,
        UUID keycloakId,
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
