package com.erp.erp.application.result;

import java.time.LocalDate;

public record LeaveResult(
        Long id,
        String type,
        LocalDate dateDebut,
        LocalDate dateFin,
        int nombreJours,
        String statut,
        String motif
) {}
