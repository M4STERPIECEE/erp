package com.erp.erp.adapter.out.persistence.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "fiche_de_paie")
public class PayslipJpaEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "employe_id", nullable = false)
    private Long employeId;

    @Column(nullable = false)
    private int mois;

    @Column(nullable = false)
    private int annee;

    @Column(name = "salaire_base", nullable = false, precision = 12, scale = 2)
    private BigDecimal salaireBase;

    @Column(name = "total_absences")
    private int totalAbsences;

    @Column(name = "deduction_absences", precision = 12, scale = 2)
    private BigDecimal deductionAbsences;

    @Column(name = "prime_presence", precision = 12, scale = 2)
    private BigDecimal primePresence;

    @Column(name = "cotisations_total", precision = 12, scale = 2)
    private BigDecimal cotisationsTotal;

    @Column(name = "salaire_net", nullable = false, precision = 12, scale = 2)
    private BigDecimal salaireNet;

    @Column(nullable = false, length = 20)
    private String statut;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
}
