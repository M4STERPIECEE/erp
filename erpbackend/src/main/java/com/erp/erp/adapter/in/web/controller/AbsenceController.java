package com.erp.erp.adapter.in.web.controller;

import com.erp.erp.application.result.AbsenceResult;
import com.erp.erp.domain.model.Absence;
import com.erp.erp.domain.model.Employee;
import com.erp.erp.domain.port.in.absence.GetAbsenceUseCase;
import com.erp.erp.domain.port.out.EmployeeRepositoryPort;
import com.erp.erp.infrastructure.exception.exceptions.EmployeeNotFoundException;
import com.erp.erp.infrastructure.exception.exceptions.UnauthorizedException;
import com.erp.erp.infrastructure.security.JwtTokenProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/${version.path}/absences")
public class AbsenceController {

    private static final Logger log = LoggerFactory.getLogger(AbsenceController.class);

    private final GetAbsenceUseCase getAbsenceUseCase;
    private final EmployeeRepositoryPort employeeRepositoryPort;
    private final JwtTokenProvider jwtTokenProvider;

    public AbsenceController(GetAbsenceUseCase getAbsenceUseCase,
                             EmployeeRepositoryPort employeeRepositoryPort,
                             JwtTokenProvider jwtTokenProvider) {
        this.getAbsenceUseCase = getAbsenceUseCase;
        this.employeeRepositoryPort = employeeRepositoryPort;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @GetMapping("/my-absences")
    @PreAuthorize("hasAnyRole('EMPLOYE', 'RH', 'ADMIN')")
    public ResponseEntity<List<AbsenceResult>> myAbsences(
            @RequestParam(required = false) Integer mois,
            @RequestParam(required = false) Integer annee) {
        Employee employee = getAuthenticatedEmployee();

        int m = mois != null ? mois : LocalDate.now().getMonthValue();
        int a = annee != null ? annee : LocalDate.now().getYear();

        List<AbsenceResult> results = getAbsenceUseCase.listEmployeeAbsences(employee.getId(), m, a)
                .stream().map(this::toResult).toList();
        return ResponseEntity.ok(results);
    }

    private Employee getAuthenticatedEmployee() {
        String keycloakId = jwtTokenProvider.getCurrentUserId()
                .orElseThrow(() -> new UnauthorizedException("Utilisateur non authentifié"));
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

    private AbsenceResult toResult(Absence a) {
        return new AbsenceResult(a.getId(), a.getDate(), a.getMotif(), a.isJustifiee());
    }
}
