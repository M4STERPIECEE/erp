package com.erp.erp.domain.model;

import com.erp.erp.domain.model.enums.LeaveStatus;
import com.erp.erp.domain.model.enums.LeaveType;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Leave {
    private Long id;
    private Long employeId;
    private Long approbateurId;
    private LeaveType type;
    private LocalDate dateDebut;
    private LocalDate dateFin;
    private int nombreJours;
    private LeaveStatus statut;
    private String motif;
    private LocalDateTime createdAt;
}
