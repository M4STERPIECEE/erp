package com.erp.erp.domain.model;

import com.erp.erp.domain.model.enums.ContractType;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Contract {
    private Long id;
    private Long employeId;
    private ContractType type;
    private LocalDate dateDebut;
    private LocalDate dateFin;
    private BigDecimal salaireBase;
}
