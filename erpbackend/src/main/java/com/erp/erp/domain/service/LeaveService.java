package com.erp.erp.domain.service;

import com.erp.erp.domain.model.Leave;
import com.erp.erp.domain.model.enums.LeaveStatus;
import com.erp.erp.domain.model.enums.LeaveType;
import com.erp.erp.domain.port.out.LeaveRepositoryPort;
import com.erp.erp.infrastructure.exception.exceptions.LeaveNotFoundException;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public class LeaveService {

    private final LeaveRepositoryPort congeRepository;

    public LeaveService(LeaveRepositoryPort congeRepository) {
        this.congeRepository = congeRepository;
    }

    public Leave requestLeave(Long employeId, String type, LocalDate dateDebut, LocalDate dateFin, String motif) {
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

        return congeRepository.save(leave);
    }

    public List<Leave> listAllLeaves() {
        return congeRepository.findAll();
    }

    public List<Leave> listEmployeeLeaves(Long employeId) {
        return congeRepository.findByEmployeeId(employeId);
    }

    public void cancelLeave(Long congeId, Long employeId) {
        Leave leave = congeRepository.findById(congeId)
                .orElseThrow(() -> new LeaveNotFoundException(congeId));

        if (!leave.getEmployeId().equals(employeId)) {
            throw new IllegalArgumentException("Ce congé ne vous appartient pas");
        }

        if (leave.getStatut() != LeaveStatus.EN_ATTENTE) {
            throw new IllegalArgumentException("Seules les demandes en attente peuvent être annulées");
        }

        congeRepository.delete(congeId);
    }

    public Leave approveLeave(Long congeId, Long approbateurId) {
        Leave leave = congeRepository.findById(congeId)
                .orElseThrow(() -> new IllegalArgumentException("Congé introuvable"));

        if (leave.getStatut() != LeaveStatus.EN_ATTENTE) {
            throw new IllegalArgumentException("Ce congé n'est plus en attente");
        }

        leave.setStatut(LeaveStatus.APPROUVE);
        leave.setApprobateurId(approbateurId);
        return congeRepository.save(leave);
    }

    public Leave rejectLeave(Long congeId, Long approbateurId) {
        Leave leave = congeRepository.findById(congeId)
                .orElseThrow(() -> new IllegalArgumentException("Congé introuvable"));

        if (leave.getStatut() != LeaveStatus.EN_ATTENTE) {
            throw new IllegalArgumentException("Ce congé n'est plus en attente");
        }

        leave.setStatut(LeaveStatus.REJETE);
        leave.setApprobateurId(approbateurId);
        return congeRepository.save(leave);
    }

    public Optional<Leave> findById(Long id) {
        return congeRepository.findById(id);
    }

    public int countLeaveDaysTakenThisYear(Long employeId) {
        return congeRepository.countApprovedLeaveDaysThisYear(employeId, LocalDate.now().getYear());
    }

    public int countPendingRequests(Long employeId) {
        return congeRepository.countPendingRequests(employeId);
    }

    public int countAllPending() {
        return congeRepository.countAllPending();
    }

    public int countAllApproved() {
        return congeRepository.countAllApproved();
    }

    public int countOnLeaveToday() {
        return congeRepository.countOnLeaveToday();
    }

    public int countPlannedThisMonth() {
        return congeRepository.countPlannedThisMonth();
    }

    private int calculateBusinessDays(LocalDate debut, LocalDate fin) {
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
}
