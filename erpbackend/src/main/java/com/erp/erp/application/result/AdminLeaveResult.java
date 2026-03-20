package com.erp.erp.application.result;

import java.time.LocalDate;

public record AdminLeaveResult(
        Long id,
        String type,
        LocalDate dateDebut,
        LocalDate dateFin,
        int nombreJours,
        String statut,
        String motif,
        Long employeId,
        String employeNom,
        String employePrenom,
        String employePoste
) {}
