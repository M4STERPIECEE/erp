package com.erp.erp.domain.model;

import com.erp.erp.domain.model.enums.LeaveStatus;
import com.erp.erp.domain.model.enums.LeaveType;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.DayOfWeek;
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

    /**
     * Calcule le nombre de jours ouvrables entre deux dates incluses.
     * Logique métier intrinsèque à l'entité (Rich Domain Model).
     */
    public static int calculateBusinessDays(LocalDate debut, LocalDate fin) {
        int jours = 0;
        LocalDate date = debut;
        while (!date.isAfter(fin)) {
            DayOfWeek dow = date.getDayOfWeek();
            if (dow != DayOfWeek.SATURDAY && dow != DayOfWeek.SUNDAY) {
                jours++;
            }
            date = date.plusDays(1);
        }
        return jours;
    }

    /**
     * Factory method : crée et initialise une demande de congé avec validation
     * métier.
     */
    public static Leave create(Long employeId, String type, LocalDate dateDebut, LocalDate dateFin, String motif) {
        if (dateFin.isBefore(dateDebut)) {
            throw new IllegalArgumentException("La date de fin doit être après la date de début");
        }
        int nombreJours = calculateBusinessDays(dateDebut, dateFin);
        if (nombreJours <= 0) {
            throw new IllegalArgumentException("La période sélectionnée ne contient aucun jour ouvrable");
        }
        Leave leave = new Leave();
        leave.setEmployeId(employeId);
        leave.setType(LeaveType.valueOf(type));
        leave.setDateDebut(dateDebut);
        leave.setDateFin(dateFin);
        leave.setNombreJours(nombreJours);
        leave.setStatut(LeaveStatus.EN_ATTENTE);
        leave.setMotif(motif);
        return leave;
    }
}
