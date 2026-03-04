package com.erp.erp.domain.service;

import com.erp.erp.domain.model.Payslip;
import com.erp.erp.domain.port.out.PayslipRepositoryPort;

import java.util.List;
import java.util.Optional;

public class PayrollService {

    private final PayslipRepositoryPort payslipRepository;

    public PayrollService(PayslipRepositoryPort payslipRepository) {
        this.payslipRepository = payslipRepository;
    }

    public List<Payslip> listerFichesEmploye(Long employeId) {
        return payslipRepository.trouverParEmployeId(employeId);
    }

    public Optional<Payslip> trouverParId(Long id) {
        return payslipRepository.trouverParId(id);
    }
}
