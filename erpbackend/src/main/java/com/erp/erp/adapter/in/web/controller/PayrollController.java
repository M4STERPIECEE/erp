package com.erp.erp.adapter.in.web.controller;

import com.erp.erp.application.result.PayslipResult;
import com.erp.erp.domain.model.Employee;
import com.erp.erp.domain.model.Payslip;
import com.erp.erp.domain.port.in.employee.GetEmployeeByEmailUseCase;
import com.erp.erp.domain.service.PayrollService;
import com.erp.erp.infrastructure.security.JwtTokenProvider;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/${version.path}/payroll")
public class PayrollController {

        private final PayrollService payrollService;
        private final GetEmployeeByEmailUseCase getEmployeeByEmailUseCase;
        private final JwtTokenProvider jwtTokenProvider;

        public PayrollController(PayrollService payrollService,
                        GetEmployeeByEmailUseCase getEmployeeByEmailUseCase,
                        JwtTokenProvider jwtTokenProvider) {
                this.payrollService = payrollService;
                this.getEmployeeByEmailUseCase = getEmployeeByEmailUseCase;
                this.jwtTokenProvider = jwtTokenProvider;
        }

        @GetMapping("/my-payslips")
        @PreAuthorize("isAuthenticated()")
        public ResponseEntity<List<PayslipResult>> myPayslips() {
                Employee employee = getAuthenticatedEmployee();
                List<PayslipResult> results = payrollService.listEmployeePayslips(employee.getId())
                                .stream().map(this::toResult).toList();
                return ResponseEntity.ok(results);
        }

        @GetMapping("/{id}/pdf")
        @PreAuthorize("isAuthenticated()")
        public ResponseEntity<byte[]> downloadPdf(@PathVariable Long id) {
                Employee employee = getAuthenticatedEmployee();
                Payslip fiche = payrollService.findById(id)
                                .orElseThrow(() -> new IllegalArgumentException("Fiche de paie introuvable"));

                if (!fiche.getEmployeId().equals(employee.getId())) {
                        throw new IllegalArgumentException("Cette fiche de paie ne vous appartient pas");
                }

                String content = String.format(
                                "FICHE DE PAIE - %02d/%d\nSalaire Base: %s\nSalaire Net: %s\nStatut: %s",
                                fiche.getMois(), fiche.getAnnee(), fiche.getSalaireBase(), fiche.getSalaireNet(),
                                fiche.getStatut());

                return ResponseEntity.ok()
                                .header("Content-Type", "application/pdf")
                                .header("Content-Disposition",
                                                "attachment; filename=fiche_" + fiche.getMois() + "_" + fiche.getAnnee()
                                                                + ".pdf")
                                .body(content.getBytes());
        }

        private Employee getAuthenticatedEmployee() {
                String email = jwtTokenProvider.getCurrentEmail()
                                .orElseThrow(() -> new IllegalArgumentException("Utilisateur non authentifié"));
                return getEmployeeByEmailUseCase.findByEmail(email)
                                .orElseThrow(() -> new IllegalArgumentException("Profil employé introuvable"));
        }

        private PayslipResult toResult(Payslip f) {
                return new PayslipResult(
                                f.getId(), f.getMois(), f.getAnnee(), f.getSalaireBase(),
                                f.getDeductionAbsences(), f.getPrimePresence(),
                                f.getCotisationsTotal(), f.getSalaireNet(),
                                f.getStatut().name());
        }
}
