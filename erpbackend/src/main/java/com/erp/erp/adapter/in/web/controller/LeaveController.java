package com.erp.erp.adapter.in.web.controller;

import com.erp.erp.application.result.LeaveResult;
import com.erp.erp.domain.model.Leave;
import com.erp.erp.domain.model.Employee;
import com.erp.erp.domain.port.out.EmployeeRepositoryPort;
import com.erp.erp.domain.service.LeaveService;
import com.erp.erp.infrastructure.security.JwtTokenProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/leaves")
public class LeaveController {

    private static final Logger log = LoggerFactory.getLogger(LeaveController.class);

    private final LeaveService leaveService;
    private final EmployeeRepositoryPort employeeRepositoryPort;
    private final JwtTokenProvider jwtTokenProvider;

    public LeaveController(LeaveService leaveService,
                           EmployeeRepositoryPort employeeRepositoryPort,
                           JwtTokenProvider jwtTokenProvider) {
        this.leaveService = leaveService;
        this.employeeRepositoryPort = employeeRepositoryPort;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @GetMapping("/my-leaves")
    @PreAuthorize("hasAnyRole('EMPLOYE', 'RH', 'ADMIN')")
    public ResponseEntity<List<LeaveResult>> myLeaves() {
        Employee employee = getAuthenticatedEmployee();
        List<LeaveResult> results = leaveService.listEmployeeLeaves(employee.getId())
                .stream().map(this::toResult).toList();
        return ResponseEntity.ok(results);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('EMPLOYE', 'RH', 'ADMIN')")
    public ResponseEntity<LeaveResult> requestLeave(@RequestBody RequestLeaveRequest request) {
        Employee employee = getAuthenticatedEmployee();
        Leave leave = leaveService.requestLeave(
                employee.getId(),
                request.type(),
                request.dateDebut(),
                request.dateFin(),
                request.motif()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(toResult(leave));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('EMPLOYE', 'RH', 'ADMIN')")
    public ResponseEntity<Void> cancelLeave(@PathVariable Long id) {
        Employee employee = getAuthenticatedEmployee();
        leaveService.cancelLeave(id, employee.getId());
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('RH', 'ADMIN')")
    public ResponseEntity<LeaveResult> approveLeave(@PathVariable Long id) {
        Employee approbateur = getAuthenticatedEmployee();
        Leave leave = leaveService.approveLeave(id, approbateur.getId());
        return ResponseEntity.ok(toResult(leave));
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('RH', 'ADMIN')")
    public ResponseEntity<LeaveResult> rejectLeave(@PathVariable Long id) {
        Employee approbateur = getAuthenticatedEmployee();
        Leave leave = leaveService.rejectLeave(id, approbateur.getId());
        return ResponseEntity.ok(toResult(leave));
    }

    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('EMPLOYE', 'RH', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> leaveStats() {
        Employee employee = getAuthenticatedEmployee();
        int daysTaken = leaveService.countLeaveDaysTakenThisYear(employee.getId());
        int pending = leaveService.countPendingRequests(employee.getId());
        int balance = 30 - daysTaken;
        return ResponseEntity.ok(Map.of(
                "daysTaken", daysTaken,
                "pending", pending,
                "remainingBalance", Math.max(balance, 0)
        ));
    }

    private Employee getAuthenticatedEmployee() {
        String keycloakId = jwtTokenProvider.getCurrentUserId()
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur non authentifié"));
        return employeeRepositoryPort.findByKeycloakId(keycloakId)
                .or(() -> {
                    String email = jwtTokenProvider.getCurrentEmail().orElse(null);
                    if (email == null) return java.util.Optional.empty();
                    log.warn("Employee not found by keycloakId={}, trying email={}", keycloakId, email);
                    return employeeRepositoryPort.findByEmail(email)
                            .map(emp -> {
                                emp.setKeycloakId(UUID.fromString(keycloakId));
                                Employee synced = employeeRepositoryPort.save(emp);
                                log.info("Auto-synced keycloakId={} for employee id={}", keycloakId, synced.getId());
                                return synced;
                            });
                })
                .orElseThrow(() -> new IllegalArgumentException("Profil employé introuvable"));
    }

    private LeaveResult toResult(Leave c) {
        return new LeaveResult(
                c.getId(), c.getType().name(), c.getDateDebut(), c.getDateFin(),
                c.getNombreJours(), c.getStatut().name(), c.getMotif()
        );
    }

    public record RequestLeaveRequest(String type, LocalDate dateDebut, LocalDate dateFin, String motif) {}
}
