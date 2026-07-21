package com.erp.erp.adapter.in.web.controller;

import com.erp.erp.application.result.AbsenceResult;
import com.erp.erp.domain.model.Absence;
import com.erp.erp.domain.model.Employee;
import com.erp.erp.domain.port.in.absence.GetAbsenceUseCase;
import com.erp.erp.domain.port.in.employee.GetEmployeeByEmailUseCase;
import com.erp.erp.infrastructure.exception.exceptions.EmployeeNotFoundException;
import com.erp.erp.infrastructure.exception.exceptions.UnauthorizedException;
import com.erp.erp.infrastructure.security.JwtTokenProvider;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/${version.path}/absences")
public class AbsenceController {

    private final GetAbsenceUseCase getAbsenceUseCase;
    private final GetEmployeeByEmailUseCase getEmployeeByEmailUseCase;
    private final JwtTokenProvider jwtTokenProvider;

    public AbsenceController(GetAbsenceUseCase getAbsenceUseCase,
            GetEmployeeByEmailUseCase getEmployeeByEmailUseCase,
            JwtTokenProvider jwtTokenProvider) {
        this.getAbsenceUseCase = getAbsenceUseCase;
        this.getEmployeeByEmailUseCase = getEmployeeByEmailUseCase;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @GetMapping("/my-absences")
    @PreAuthorize("isAuthenticated()")
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
        String email = jwtTokenProvider.getCurrentEmail()
                .orElseThrow(() -> new UnauthorizedException("Utilisateur non authentifié"));
        return getEmployeeByEmailUseCase.findByEmail(email)
                .orElseThrow(() -> new EmployeeNotFoundException("Profil employé introuvable"));
    }

    private AbsenceResult toResult(Absence a) {
        return new AbsenceResult(a.getId(), a.getDate(), a.getMotif(), a.isJustifiee());
    }
}
