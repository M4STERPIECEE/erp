package com.erp.erp.adapter.in.web.controller;

import com.erp.erp.application.result.AdminLeaveResult;
import com.erp.erp.application.result.LeaveResult;
import com.erp.erp.domain.model.Employee;
import com.erp.erp.domain.model.Leave;
import com.erp.erp.domain.port.in.leave.ApproveLeaveUseCase;
import com.erp.erp.domain.port.in.leave.GetLeaveUseCase;
import com.erp.erp.domain.port.in.leave.RejectLeaveUseCase;
import com.erp.erp.domain.port.in.leave.RequestLeaveUseCase;
import com.erp.erp.domain.port.out.EmployeeRepositoryPort;
import com.erp.erp.infrastructure.exception.exceptions.EmployeeNotFoundException;
import com.erp.erp.infrastructure.exception.exceptions.UnauthorizedException;
import com.erp.erp.infrastructure.security.JwtTokenProvider;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/${version.path}/leaves")
public class LeaveController {

    private final RequestLeaveUseCase requestLeaveUseCase;
    private final GetLeaveUseCase getLeaveUseCase;
    private final ApproveLeaveUseCase approveLeaveUseCase;
    private final RejectLeaveUseCase rejectLeaveUseCase;
    private final EmployeeRepositoryPort employeeRepositoryPort;
    private final JwtTokenProvider jwtTokenProvider;

    public LeaveController(RequestLeaveUseCase requestLeaveUseCase,
            GetLeaveUseCase getLeaveUseCase,
            ApproveLeaveUseCase approveLeaveUseCase,
            RejectLeaveUseCase rejectLeaveUseCase,
            EmployeeRepositoryPort employeeRepositoryPort,
            JwtTokenProvider jwtTokenProvider) {
        this.requestLeaveUseCase = requestLeaveUseCase;
        this.getLeaveUseCase = getLeaveUseCase;
        this.approveLeaveUseCase = approveLeaveUseCase;
        this.rejectLeaveUseCase = rejectLeaveUseCase;
        this.employeeRepositoryPort = employeeRepositoryPort;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @GetMapping("/my-leaves")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<LeaveResult>> myLeaves() {
        Employee employee = getAuthenticatedEmployee();
        List<LeaveResult> results = getLeaveUseCase.listEmployeeLeaves(employee.getId())
                .stream().map(this::toResult).toList();
        return ResponseEntity.ok(results);
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<LeaveResult> requestLeave(@RequestBody RequestLeaveRequest request) {
        Employee employee = getAuthenticatedEmployee();
        Leave leave = requestLeaveUseCase.requestLeave(
                employee.getId(),
                request.type(),
                request.dateDebut(),
                request.dateFin(),
                request.motif());
        return ResponseEntity.status(HttpStatus.CREATED).body(toResult(leave));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> cancelLeave(@PathVariable Long id) {
        Employee employee = getAuthenticatedEmployee();
        requestLeaveUseCase.cancelLeave(id, employee.getId());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/stats")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> leaveStats() {
        Employee employee = getAuthenticatedEmployee();
        int daysTaken = getLeaveUseCase.countLeaveDaysTakenThisYear(employee.getId());
        int pending = getLeaveUseCase.countPendingRequests(employee.getId());
        int balance = 30 - daysTaken;
        return ResponseEntity.ok(Map.of(
                "daysTaken", daysTaken,
                "pending", pending,
                "remainingBalance", Math.max(balance, 0)));
    }

    // ---- Routes admin ----

    @GetMapping
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<List<AdminLeaveResult>> allLeaves(
            @RequestParam(required = false) String statut,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long departementId,
            @RequestParam(required = false) String dateDebut,
            @RequestParam(required = false) String dateFin) {
        LocalDate debut = (dateDebut != null && !dateDebut.isBlank()) ? LocalDate.parse(dateDebut) : null;
        LocalDate fin = (dateFin != null && !dateFin.isBlank()) ? LocalDate.parse(dateFin) : null;
        return ResponseEntity.ok(getLeaveUseCase.searchLeaves(statut, search, departementId, debut, fin));
    }

    @GetMapping("/admin-stats")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<Map<String, Object>> adminStats() {
        return ResponseEntity.ok(Map.of(
                "pending", getLeaveUseCase.countAllPending(),
                "approved", getLeaveUseCase.countAllApproved(),
                "onLeaveToday", getLeaveUseCase.countOnLeaveToday(),
                "plannedThisMonth", getLeaveUseCase.countPlannedThisMonth()));
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<LeaveResult> approveLeave(@PathVariable Long id) {
        Long approbateurId = findAuthenticatedEmployeeId();
        Leave leave = approveLeaveUseCase.approveLeave(id, approbateurId);
        return ResponseEntity.ok(toResult(leave));
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<LeaveResult> rejectLeave(@PathVariable Long id) {
        Long approbateurId = findAuthenticatedEmployeeId();
        Leave leave = rejectLeaveUseCase.rejectLeave(id, approbateurId);
        return ResponseEntity.ok(toResult(leave));
    }

    private Employee getAuthenticatedEmployee() {
        String email = jwtTokenProvider.getCurrentEmail()
                .orElseThrow(() -> new UnauthorizedException("Utilisateur non authentifié"));
        return employeeRepositoryPort.findByEmail(email)
                .orElseThrow(() -> new EmployeeNotFoundException("Profil employé introuvable"));
    }

    private Long findAuthenticatedEmployeeId() {
        String email = jwtTokenProvider.getCurrentEmail().orElse(null);
        if (email == null)
            return null;
        return employeeRepositoryPort.findByEmail(email)
                .map(Employee::getId)
                .orElse(null);
    }

    private LeaveResult toResult(Leave c) {
        return new LeaveResult(
                c.getId(), c.getType().name(), c.getDateDebut(), c.getDateFin(),
                c.getNombreJours(), c.getStatut().name(), c.getMotif(),
                c.getCreatedAt() != null ? c.getCreatedAt().toLocalDate() : null);
    }

    public record RequestLeaveRequest(String type, LocalDate dateDebut, LocalDate dateFin, String motif) {
    }
}