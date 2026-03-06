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

    public List<Payslip> listEmployeePayslips(Long employeId) {
        return payslipRepository.findByEmployeeId(employeId);
    }

    public Optional<Payslip> findById(Long id) {
        return payslipRepository.findById(id);
    }
}
