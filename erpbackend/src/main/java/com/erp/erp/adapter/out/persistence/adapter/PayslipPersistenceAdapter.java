package com.erp.erp.adapter.out.persistence.adapter;

import com.erp.erp.adapter.out.persistence.entity.PayslipJpaEntity;
import com.erp.erp.adapter.out.persistence.repository.PayslipJpaRepository;
import com.erp.erp.domain.model.Payslip;
import com.erp.erp.domain.model.enums.PayslipStatus;
import com.erp.erp.domain.port.out.PayslipRepositoryPort;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
public class PayslipPersistenceAdapter implements PayslipRepositoryPort {

    private final PayslipJpaRepository repository;

    public PayslipPersistenceAdapter(PayslipJpaRepository repository) {
        this.repository = repository;
    }

    @Override
    public List<Payslip> trouverParEmployeId(Long employeId) {
        return repository.findByEmployeIdOrderByAnneeDescMoisDesc(employeId)
                .stream().map(this::toDomain).toList();
    }

    @Override
    public Optional<Payslip> trouverParId(Long id) {
        return repository.findById(id).map(this::toDomain);
    }

    private Payslip toDomain(PayslipJpaEntity e) {
        Payslip f = new Payslip();
        f.setId(e.getId());
        f.setEmployeId(e.getEmployeId());
        f.setMois(e.getMois());
        f.setAnnee(e.getAnnee());
        f.setSalaireBase(e.getSalaireBase());
        f.setTotalAbsences(e.getTotalAbsences());
        f.setDeductionAbsences(e.getDeductionAbsences());
        f.setPrimePresence(e.getPrimePresence());
        f.setCotisationsTotal(e.getCotisationsTotal());
        f.setSalaireNet(e.getSalaireNet());
        f.setStatut(PayslipStatus.valueOf(e.getStatut()));
        return f;
    }
}
