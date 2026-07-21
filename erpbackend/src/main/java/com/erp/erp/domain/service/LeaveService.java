package com.erp.erp.domain.service;

import com.erp.erp.application.mapper.LeaveServiceMapper;
import com.erp.erp.application.result.AdminLeaveResult;
import com.erp.erp.domain.exception.LeaveNotFoundException;
import com.erp.erp.domain.model.Employee;
import com.erp.erp.domain.model.Leave;
import com.erp.erp.domain.model.enums.LeaveStatus;
import com.erp.erp.domain.port.in.leave.ApproveLeaveUseCase;
import com.erp.erp.domain.port.in.leave.GetLeaveUseCase;
import com.erp.erp.domain.port.in.leave.RejectLeaveUseCase;
import com.erp.erp.domain.port.in.leave.RequestLeaveUseCase;
import com.erp.erp.domain.port.out.EmployeeRepositoryPort;
import com.erp.erp.domain.port.out.LeaveRepositoryPort;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;

public class LeaveService implements RequestLeaveUseCase, GetLeaveUseCase, ApproveLeaveUseCase, RejectLeaveUseCase {

    private final LeaveRepositoryPort congeRepository;
    private final EmployeeRepositoryPort employeeRepositoryPort;
    private final LeaveServiceMapper mapper;

    public LeaveService(LeaveRepositoryPort congeRepository, EmployeeRepositoryPort employeeRepositoryPort) {
        this.congeRepository = congeRepository;
        this.employeeRepositoryPort = employeeRepositoryPort;
        this.mapper = new LeaveServiceMapper();
    }

    @Override
    public Leave requestLeave(Long employeId, String type, LocalDate dateDebut, LocalDate dateFin, String motif) {
        Leave leave = Leave.create(employeId, type, dateDebut, dateFin, motif);
        return congeRepository.save(leave);
    }

    @Override
    public List<Leave> listEmployeeLeaves(Long employeId) {
        return congeRepository.findByEmployeeId(employeId);
    }

    @Override
    public List<Leave> listAllLeavesFiltered(String statut) {
        return congeRepository.findAllFiltered(statut);
    }

    @Override
    public List<AdminLeaveResult> searchLeaves(String statut, String search, Long departementId,
            LocalDate dateDebut, LocalDate dateFin) {
        List<Leave> leaves = congeRepository.findAllFiltered(statut);

        List<Long> employeIds = leaves.stream().map(Leave::getEmployeId).distinct().toList();
        Map<Long, Employee> employeeMap = employeeRepositoryPort.findAllByIds(employeIds)
                .stream().collect(Collectors.toMap(Employee::getId, Function.identity()));

        return leaves.stream()
                .filter(c -> {
                    if (dateDebut != null && c.getDateFin().isBefore(dateDebut))
                        return false;
                    if (dateFin != null && c.getDateDebut().isAfter(dateFin))
                        return false;
                    Employee emp = employeeMap.get(c.getEmployeId());
                    if (departementId != null) {
                        if (emp == null || !departementId.equals(emp.getDepartementId()))
                            return false;
                    }
                    if (search != null && !search.isBlank()) {
                        if (emp == null)
                            return false;
                        String s = search.toLowerCase();
                        return emp.getNom().toLowerCase().contains(s) || emp.getPrenom().toLowerCase().contains(s);
                    }
                    return true;
                })
                .map(c -> mapper.toAdminResult(c, employeeMap.get(c.getEmployeId())))
                .toList();
    }

    @Override
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

    @Override
    public Leave approveLeave(Long congeId, Long approbateurId) {
        Leave leave = congeRepository.findById(congeId)
                .orElseThrow(() -> new LeaveNotFoundException(congeId));

        if (leave.getStatut() != LeaveStatus.EN_ATTENTE) {
            throw new IllegalArgumentException("Ce congé n'est plus en attente");
        }
        leave.setStatut(LeaveStatus.APPROUVE);
        leave.setApprobateurId(approbateurId);
        return congeRepository.save(leave);
    }

    @Override
    public Leave rejectLeave(Long congeId, Long approbateurId) {
        Leave leave = congeRepository.findById(congeId)
                .orElseThrow(() -> new LeaveNotFoundException(congeId));

        if (leave.getStatut() != LeaveStatus.EN_ATTENTE) {
            throw new IllegalArgumentException("Ce congé n'est plus en attente");
        }
        leave.setStatut(LeaveStatus.REJETE);
        leave.setApprobateurId(approbateurId);
        return congeRepository.save(leave);
    }

    @Override
    public Optional<Leave> findById(Long id) {
        return congeRepository.findById(id);
    }

    @Override
    public int countLeaveDaysTakenThisYear(Long employeId) {
        return congeRepository.countApprovedLeaveDaysThisYear(employeId, LocalDate.now().getYear());
    }

    @Override
    public int countPendingRequests(Long employeId) {
        return congeRepository.countPendingRequests(employeId);
    }

    @Override
    public int countAllPending() {
        return congeRepository.countAllPending();
    }

    @Override
    public int countAllApproved() {
        return congeRepository.countAllApproved();
    }

    @Override
    public int countOnLeaveToday() {
        return congeRepository.countOnLeaveToday();
    }

    @Override
    public int countPlannedThisMonth() {
        return congeRepository.countPlannedThisMonth();
    }
}