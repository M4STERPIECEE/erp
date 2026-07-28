package com.erp.erp.adapter.in.web.controller;

import com.erp.erp.application.result.AbsenceResult;
import com.erp.erp.domain.model.Employee;
import com.erp.erp.domain.port.in.absence.GetAbsenceUseCase;
import com.erp.erp.adapter.in.web.mapper.AbsenceWebMapper;
import com.erp.erp.infrastructure.security.AuthenticatedUserProvider;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/${version.path}/absences")
public class AbsenceController {

    private final GetAbsenceUseCase getAbsenceUseCase;
    private final AbsenceWebMapper mapper;
    private final AuthenticatedUserProvider authenticatedUserProvider;

    public AbsenceController(GetAbsenceUseCase getAbsenceUseCase,
            AbsenceWebMapper mapper,
            AuthenticatedUserProvider authenticatedUserProvider) {
        this.getAbsenceUseCase = getAbsenceUseCase;
        this.mapper = mapper;
        this.authenticatedUserProvider = authenticatedUserProvider;
    }

    @GetMapping("/my-absences")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<AbsenceResult>> myAbsences(
            @RequestParam(required = false) Integer mois,
            @RequestParam(required = false) Integer annee) {
        Employee employee = authenticatedUserProvider.getAuthenticatedEmployee();

        int m = mois != null ? mois : LocalDate.now().getMonthValue();
        int a = annee != null ? annee : LocalDate.now().getYear();

        List<AbsenceResult> results = getAbsenceUseCase.listEmployeeAbsences(employee.getId(), m, a)
                .stream().map(mapper::toResult).toList();
        return ResponseEntity.ok(results);
    }
}
