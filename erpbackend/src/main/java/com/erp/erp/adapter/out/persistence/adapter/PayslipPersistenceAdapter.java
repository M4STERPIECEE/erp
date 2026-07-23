package com.erp.erp.adapter.out.persistence.adapter;

import com.erp.erp.adapter.out.persistence.mapper.PayslipJpaMapper;
import com.erp.erp.adapter.out.persistence.repository.PayslipJpaRepository;
import com.erp.erp.domain.model.Payslip;
import com.erp.erp.domain.port.out.PayslipRepositoryPort;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
public class PayslipPersistenceAdapter implements PayslipRepositoryPort {

    private final PayslipJpaRepository repository;
    private final PayslipJpaMapper mapper;

    public PayslipPersistenceAdapter(PayslipJpaRepository repository, PayslipJpaMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    @Override
    public List<Payslip> findByEmployeeId(Long employeId) {
        return repository.findByEmployeIdOrderByAnneeDescMoisDesc(employeId)
                .stream().map(mapper::toDomain).toList();
    }

    @Override
    public Optional<Payslip> findById(Long id) {
        return repository.findById(id).map(mapper::toDomain);
    }
}
