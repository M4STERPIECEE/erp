package com.erp.erp.domain.port.out;

import com.erp.erp.domain.model.Payslip;

import java.util.List;
import java.util.Optional;

public interface PayslipRepositoryPort {
    List<Payslip> trouverParEmployeId(Long employeId);
    Optional<Payslip> trouverParId(Long id);
}
