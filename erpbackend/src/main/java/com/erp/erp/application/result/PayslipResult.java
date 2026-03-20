package com.erp.erp.application.result;

import java.math.BigDecimal;

public record PayslipResult(
        Long id,
        int mois,
        int annee,
        BigDecimal salaireBase,
        BigDecimal deductionAbsences,
        BigDecimal primePresence,
        BigDecimal cotisationsTotal,
        BigDecimal salaireNet,
        String statut
) {}
