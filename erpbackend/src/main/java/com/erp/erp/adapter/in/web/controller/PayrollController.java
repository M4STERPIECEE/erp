package com.erp.erp.adapter.in.web.controller;

import com.erp.erp.application.result.PayslipResult;
import com.erp.erp.domain.model.Employee;
import com.erp.erp.domain.model.Payslip;
import com.erp.erp.domain.port.out.EmployeeRepositoryPort;
import com.erp.erp.domain.service.PayrollService;
import com.erp.erp.infrastructure.security.JwtTokenProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/${version.path}/payroll")
public class PayrollController {

    private static final Logger log = LoggerFactory.getLogger(PayrollController.class);

    private final PayrollService payrollService;
    private final EmployeeRepositoryPort employeeRepositoryPort;
    private final JwtTokenProvider jwtTokenProvider;
    public PayrollController(PayrollService payrollService,
                             EmployeeRepositoryPort employeeRepositoryPort,
                             JwtTokenProvider jwtTokenProvider) {
        this.payrollService = payrollService;
        this.employeeRepositoryPort = employeeRepositoryPort;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @GetMapping("/my-payslips")
    @PreAuthorize("hasAnyRole('EMPLOYE', 'RH', 'ADMIN')")
    public ResponseEntity<List<PayslipResult>> myPayslips() {
        Employee employee = getAuthenticatedEmployee();
        List<PayslipResult> results = payrollService.listEmployeePayslips(employee.getId())
                .stream().map(this::toResult).toList();
        return ResponseEntity.ok(results);
    }

    @GetMapping("/{id}/pdf")
    @PreAuthorize("hasAnyRole('EMPLOYE', 'RH', 'ADMIN')")
    public ResponseEntity<byte[]> downloadPdf(@PathVariable Long id) {
        Employee employee = getAuthenticatedEmployee();
        Payslip fiche = payrollService.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Fiche de paie introuvable"));

        if (!fiche.getEmployeId().equals(employee.getId())) {
            throw new IllegalArgumentException("Cette fiche de paie ne vous appartient pas");
        }

        String content = String.format(
                "FICHE DE PAIE - %02d/%d\nSalaire Base: %s\nSalaire Net: %s\nStatut: %s",
                fiche.getMois(), fiche.getAnnee(), fiche.getSalaireBase(), fiche.getSalaireNet(), fiche.getStatut()
        );

        return ResponseEntity.ok()
                .header("Content-Type", "application/pdf")
                .header("Content-Disposition", "attachment; filename=fiche_" + fiche.getMois() + "_" + fiche.getAnnee() + ".pdf")
                .body(content.getBytes());
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

    private PayslipResult toResult(Payslip f) {
        return new PayslipResult(
                f.getId(), f.getMois(), f.getAnnee(), f.getSalaireBase(),
                f.getDeductionAbsences(), f.getPrimePresence(),
                f.getCotisationsTotal(), f.getSalaireNet(),
                f.getStatut().name()
        );
    }
}
