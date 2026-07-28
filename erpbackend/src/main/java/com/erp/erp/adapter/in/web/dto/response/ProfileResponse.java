package com.erp.erp.adapter.in.web.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ProfileResponse(
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
        String departement,
        String contractType,
        BigDecimal salaireBase,
        LocalDate dateDebutContrat,
        LocalDate dateFinContrat
) {}