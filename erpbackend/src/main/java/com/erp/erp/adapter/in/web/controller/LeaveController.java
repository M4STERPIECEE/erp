package com.erp.erp.adapter.in.web.controller;

import com.erp.erp.application.result.LeaveResult;
import com.erp.erp.domain.model.Leave;
import com.erp.erp.domain.model.Employee;
import com.erp.erp.domain.port.out.EmployeeRepositoryPort;
import com.erp.erp.domain.service.LeaveService;
import com.erp.erp.infrastructure.security.JwtTokenProvider;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/conges")
public class LeaveController {

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

    @GetMapping("/mes-conges")
    @PreAuthorize("hasAnyRole('Employee', 'RH', 'ADMIN')")
    public ResponseEntity<List<LeaveResult>> mesConges() {
        Employee employee = getEmployeConnecte();
        List<LeaveResult> results = leaveService.listerCongesEmploye(employee.getId())
                .stream().map(this::toResult).toList();
        return ResponseEntity.ok(results);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('Employee', 'RH', 'ADMIN')")
    public ResponseEntity<LeaveResult> demanderConge(@RequestBody RequestLeaveRequest request) {
        Employee employee = getEmployeConnecte();
        Leave leave = leaveService.demanderConge(
                employee.getId(),
                request.type(),
                request.dateDebut(),
                request.dateFin(),
                request.motif()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(toResult(leave));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('Employee', 'RH', 'ADMIN')")
    public ResponseEntity<Void> annulerConge(@PathVariable Long id) {
        Employee employee = getEmployeConnecte();
        leaveService.annulerConge(id, employee.getId());
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/approuver")
    @PreAuthorize("hasAnyRole('RH', 'ADMIN')")
    public ResponseEntity<LeaveResult> approuverConge(@PathVariable Long id) {
        Employee approbateur = getEmployeConnecte();
        Leave leave = leaveService.approuverConge(id, approbateur.getId());
        return ResponseEntity.ok(toResult(leave));
    }

    @PutMapping("/{id}/rejeter")
    @PreAuthorize("hasAnyRole('RH', 'ADMIN')")
    public ResponseEntity<LeaveResult> rejeterConge(@PathVariable Long id) {
        Employee approbateur = getEmployeConnecte();
        Leave leave = leaveService.rejeterConge(id, approbateur.getId());
        return ResponseEntity.ok(toResult(leave));
    }

    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('Employee', 'RH', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> statsConges() {
        Employee employee = getEmployeConnecte();
        int joursPris = leaveService.compterJoursCongesPrisCetteAnnee(employee.getId());
        int enAttente = leaveService.compterDemandesEnAttente(employee.getId());
        int solde = 30 - joursPris;
        return ResponseEntity.ok(Map.of(
                "joursPris", joursPris,
                "enAttente", enAttente,
                "soldeRestant", Math.max(solde, 0)
        ));
    }

    private Employee getEmployeConnecte() {
        String keycloakId = jwtTokenProvider.getCurrentUserId()
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur non authentifié"));
        return employeeRepositoryPort.trouverParKeycloakId(keycloakId)
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
