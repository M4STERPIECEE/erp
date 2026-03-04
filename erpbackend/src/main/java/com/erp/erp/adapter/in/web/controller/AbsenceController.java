package com.erp.erp.adapter.in.web.controller;

import com.erp.erp.application.result.AbsenceResult;
import com.erp.erp.domain.model.Absence;
import com.erp.erp.domain.model.Employee;
import com.erp.erp.domain.port.out.EmployeeRepositoryPort;
import com.erp.erp.domain.service.AbsenceService;
import com.erp.erp.infrastructure.security.JwtTokenProvider;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/absences")
public class AbsenceController {

    private final AbsenceService absenceService;
    private final EmployeeRepositoryPort employeeRepositoryPort;
    private final JwtTokenProvider jwtTokenProvider;

    public AbsenceController(AbsenceService absenceService,
                             EmployeeRepositoryPort employeeRepositoryPort,
                             JwtTokenProvider jwtTokenProvider) {
        this.absenceService = absenceService;
        this.employeeRepositoryPort = employeeRepositoryPort;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @GetMapping("/mes-absences")
    @PreAuthorize("hasAnyRole('Employee', 'RH', 'ADMIN')")
    public ResponseEntity<List<AbsenceResult>> mesAbsences(
            @RequestParam(required = false) Integer mois,
            @RequestParam(required = false) Integer annee) {
        Employee employee = getEmployeConnecte();

        int m = mois != null ? mois : LocalDate.now().getMonthValue();
        int a = annee != null ? annee : LocalDate.now().getYear();

        List<AbsenceResult> results = absenceService.listerAbsencesEmploye(employee.getId(), m, a)
                .stream().map(this::toResult).toList();
        return ResponseEntity.ok(results);
    }

    private Employee getEmployeConnecte() {
        String keycloakId = jwtTokenProvider.getCurrentUserId()
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur non authentifié"));
        return employeeRepositoryPort.trouverParKeycloakId(keycloakId)
                .orElseThrow(() -> new IllegalArgumentException("Profil employé introuvable"));
    }

    private AbsenceResult toResult(Absence a) {
        return new AbsenceResult(a.getId(), a.getDate(), a.getMotif(), a.isJustifiee());
    }
}
