package com.erp.erp.domain.service;

import com.erp.erp.domain.model.Absence;
import com.erp.erp.domain.port.out.AbsenceRepositoryPort;

import java.util.List;

public class AbsenceService {

    private final AbsenceRepositoryPort absenceRepository;

    public AbsenceService(AbsenceRepositoryPort absenceRepository) {
        this.absenceRepository = absenceRepository;
    }

    public List<Absence> listerAbsencesEmploye(Long employeId, int mois, int annee) {
        return absenceRepository.trouverParEmployeIdEtMois(employeId, mois, annee);
    }

    public int compterAbsencesMoisCourant(Long employeId, int mois, int annee) {
        return absenceRepository.compterAbsencesMoisCourant(employeId, mois, annee);
    }
}
