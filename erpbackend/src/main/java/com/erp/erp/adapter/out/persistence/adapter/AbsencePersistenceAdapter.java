package com.erp.erp.adapter.out.persistence.adapter;

import com.erp.erp.adapter.out.persistence.entity.AbsenceJpaEntity;
import com.erp.erp.adapter.out.persistence.repository.AbsenceJpaRepository;
import com.erp.erp.domain.model.Absence;
import com.erp.erp.domain.port.out.AbsenceRepositoryPort;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class AbsencePersistenceAdapter implements AbsenceRepositoryPort {

    private final AbsenceJpaRepository repository;

    public AbsencePersistenceAdapter(AbsenceJpaRepository repository) {
        this.repository = repository;
    }

    @Override
    public List<Absence> trouverParEmployeIdEtMois(Long employeId, int mois, int annee) {
        return repository.findByEmployeIdAndMois(employeId, mois, annee)
                .stream().map(this::toDomain).toList();
    }

    @Override
    public int compterAbsencesMoisCourant(Long employeId, int mois, int annee) {
        return repository.compterAbsences(employeId, mois, annee);
    }

    private Absence toDomain(AbsenceJpaEntity e) {
        Absence a = new Absence();
        a.setId(e.getId());
        a.setEmployeId(e.getEmployeId());
        a.setDate(e.getDate());
        a.setMotif(e.getMotif());
        a.setJustifiee(e.isJustifiee());
        return a;
    }
}
