package com.erp.erp.adapter.out.persistence.adapter;

import com.erp.erp.adapter.out.persistence.mapper.AbsenceJpaMapper;
import com.erp.erp.adapter.out.persistence.repository.AbsenceJpaRepository;
import com.erp.erp.domain.model.Absence;
import com.erp.erp.domain.port.out.AbsenceRepositoryPort;
import org.springframework.stereotype.Component;
import java.util.List;

@Component
public class AbsencePersistenceAdapter implements AbsenceRepositoryPort {
    private final AbsenceJpaRepository repository;
    private final AbsenceJpaMapper mapper;

    public AbsencePersistenceAdapter(AbsenceJpaRepository repository, AbsenceJpaMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    @Override
    public List<Absence> findByEmployeeIdAndMonth(Long employeId, int mois, int annee) {
        return repository.findByEmployeIdAndMois(employeId, mois, annee)
                .stream().map(mapper::toDomain).toList();
    }

    @Override
    public int countAbsencesCurrentMonth(Long employeId, int mois, int annee) {
        return repository.countAbsences(employeId, mois, annee);
    }
}
