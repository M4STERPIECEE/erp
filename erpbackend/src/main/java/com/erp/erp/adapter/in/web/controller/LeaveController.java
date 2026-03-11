package com.erp.erp.adapter.in.web.controller;

import com.erp.erp.application.result.AdminLeaveResult;
import com.erp.erp.application.result.LeaveResult;
import com.erp.erp.domain.model.Leave;
import com.erp.erp.domain.model.Employee;
import com.erp.erp.domain.port.out.EmployeeRepositoryPort;
import com.erp.erp.domain.service.LeaveService;
import com.erp.erp.infrastructure.exception.exceptions.EmployeeNotFoundException;
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
import java.util.function.Function;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/${version.path}/leaves")
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

    @GetMapping
    @PreAuthorize("hasAnyRole('RH', 'ADMIN')")
    public ResponseEntity<List<AdminLeaveResult>> allLeaves(
            @RequestParam(required = false) String statut,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long departementId,
            @RequestParam(required = false) String dateDebut,
            @RequestParam(required = false) String dateFin) {

        List<Leave> leaves = leaveService.listAllLeavesFiltered(statut);

        List<Long> employeIds = leaves.stream()
                .map(Leave::getEmployeId).distinct().toList();
        Map<Long, Employee> employeeMap = employeeRepositoryPort.findAllByIds(employeIds)
                .stream().collect(Collectors.toMap(Employee::getId, Function.identity()));

        final LocalDate parsedDateDebut = (dateDebut != null && !dateDebut.isBlank()) ? LocalDate.parse(dateDebut) : null;
        final LocalDate parsedDateFin   = (dateFin   != null && !dateFin.isBlank())   ? LocalDate.parse(dateFin)   : null;

        List<AdminLeaveResult> results = leaves.stream()
                .filter(c -> {
                    // Date overlap: keep leaves that overlap with the selected period
                    if (parsedDateDebut != null && c.getDateFin().isBefore(parsedDateDebut)) return false;
                    if (parsedDateFin   != null && c.getDateDebut().isAfter(parsedDateFin))  return false;
                    Employee emp = employeeMap.get(c.getEmployeId());
                    if (departementId != null) {
                        if (emp == null || !departementId.equals(emp.getDepartementId())) return false;
                    }
                    if (search != null && !search.isBlank()) {
                        if (emp == null) return false;
                        String s = search.toLowerCase();
                        return emp.getNom().toLowerCase().contains(s) || emp.getPrenom().toLowerCase().contains(s);
                    }
                    return true;
                })
                .map(c -> {
                    Employee emp = employeeMap.get(c.getEmployeId());
                    return new AdminLeaveResult(
                            c.getId(), c.getType().name(), c.getDateDebut(), c.getDateFin(),
                            c.getNombreJours(), c.getStatut().name(), c.getMotif(),
                            c.getEmployeId(),
                            emp != null ? emp.getNom() : "Inconnu",
                            emp != null ? emp.getPrenom() : "",
                            emp != null ? emp.getPoste() : ""
                    );
                }).toList();
        return ResponseEntity.ok(results);
    }

    @GetMapping("/admin-stats")
    @PreAuthorize("hasAnyRole('RH', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> adminStats() {
        return ResponseEntity.ok(Map.of(
                "pending", leaveService.countAllPending(),
                "approved", leaveService.countAllApproved(),
                "onLeaveToday", leaveService.countOnLeaveToday(),
                "plannedThisMonth", leaveService.countPlannedThisMonth()
        ));
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
        Long approbateurId = findAuthenticatedEmployeeId();
        Leave leave = leaveService.approveLeave(id, approbateurId);
        return ResponseEntity.ok(toResult(leave));
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('RH', 'ADMIN')")
    public ResponseEntity<LeaveResult> rejectLeave(@PathVariable Long id) {
        Long approbateurId = findAuthenticatedEmployeeId();
        Leave leave = leaveService.rejectLeave(id, approbateurId);
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
                .orElseThrow(() -> new EmployeeNotFoundException("Profil employé introuvable"));
    }

    private Long findAuthenticatedEmployeeId() {
        String keycloakId = jwtTokenProvider.getCurrentUserId().orElse(null);
        if (keycloakId == null) return null;
        return employeeRepositoryPort.findByKeycloakId(keycloakId)
                .or(() -> {
                    String email = jwtTokenProvider.getCurrentEmail().orElse(null);
                    if (email == null) return java.util.Optional.empty();
                    return employeeRepositoryPort.findByEmail(email);
                })
                .map(Employee::getId)
                .orElse(null);
    }

    private LeaveResult toResult(Leave c) {
        return new LeaveResult(
                c.getId(), c.getType().name(), c.getDateDebut(), c.getDateFin(),
                c.getNombreJours(), c.getStatut().name(), c.getMotif(),
                c.getCreatedAt() != null ? c.getCreatedAt().toLocalDate() : null
        );
    }

    public record RequestLeaveRequest(String type, LocalDate dateDebut, LocalDate dateFin, String motif) {}
}
