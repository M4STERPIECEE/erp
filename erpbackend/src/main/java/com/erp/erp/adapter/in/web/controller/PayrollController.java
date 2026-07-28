package com.erp.erp.adapter.in.web.controller;

import com.erp.erp.adapter.in.web.mapper.PayrollWebMapper;
import com.erp.erp.application.result.PayslipResult;
import com.erp.erp.domain.model.Employee;
import com.erp.erp.domain.model.Payslip;
import com.erp.erp.domain.service.PayrollService;
import com.erp.erp.domain.exception.PayslipNotFoundException;
import com.erp.erp.domain.exception.UnauthorizedException;
import com.erp.erp.infrastructure.security.AuthenticatedUserProvider;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/${version.path}/payroll")
public class PayrollController {

        private final PayrollService payrollService;
        private final PayrollWebMapper payrollWebMapper;
        private final AuthenticatedUserProvider authenticatedUserProvider;

        public PayrollController(PayrollService payrollService,
                        PayrollWebMapper payrollWebMapper,
                        AuthenticatedUserProvider authenticatedUserProvider) {
                this.payrollService = payrollService;
                this.payrollWebMapper = payrollWebMapper;
                this.authenticatedUserProvider = authenticatedUserProvider;
        }

        @GetMapping("/my-payslips")
        @PreAuthorize("isAuthenticated()")
        public ResponseEntity<List<PayslipResult>> myPayslips() {
                Employee employee = authenticatedUserProvider.getAuthenticatedEmployee();
                List<PayslipResult> results = payrollService.listEmployeePayslips(employee.getId())
                                .stream().map(payrollWebMapper::toResult).toList();
                return ResponseEntity.ok(results);
        }

        @GetMapping("/{id}/pdf")
        @PreAuthorize("isAuthenticated()")
        public ResponseEntity<byte[]> downloadPdf(@PathVariable Long id) {
                Employee employee = authenticatedUserProvider.getAuthenticatedEmployee();
                Payslip fiche = payrollService.findById(id)
                                .orElseThrow(() -> new PayslipNotFoundException("Fiche de paie introuvable"));

                if (!fiche.getEmployeId().equals(employee.getId())) {
                        throw new UnauthorizedException("Cette fiche de paie ne vous appartient pas");
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
}
