package com.erp.erp.domain.service;

import com.erp.erp.domain.model.Absence;
import com.erp.erp.domain.port.out.AbsenceRepositoryPort;

import java.util.List;

public class AbsenceService {

    private final AbsenceRepositoryPort absenceRepository;

    public AbsenceService(AbsenceRepositoryPort absenceRepository) {
        this.absenceRepository = absenceRepository;
    }

    public List<Absence> listEmployeeAbsences(Long employeId, int mois, int annee) {
        return absenceRepository.findByEmployeeIdAndMonth(employeId, mois, annee);
    }

    public int countAbsencesCurrentMonth(Long employeId, int mois, int annee) {
        return absenceRepository.countAbsencesCurrentMonth(employeId, mois, annee);
    }
}
