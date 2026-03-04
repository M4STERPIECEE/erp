package com.erp.erp.domain.model;

import com.erp.erp.domain.model.enums.PayslipStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Payslip {
    private Long id;
    private Long employeId;
    private int mois;
    private int annee;
    private BigDecimal salaireBase;
    private int totalAbsences;
    private BigDecimal deductionAbsences;
    private BigDecimal primePresence;
    private BigDecimal cotisationsTotal;
    private BigDecimal salaireNet;
    private PayslipStatus statut;
}
