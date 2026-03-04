package com.erp.erp.domain.port.out;

import com.erp.erp.domain.model.Absence;

import java.util.List;

public interface AbsenceRepositoryPort {
    List<Absence> trouverParEmployeIdEtMois(Long employeId, int mois, int annee);
    int compterAbsencesMoisCourant(Long employeId, int mois, int annee);
}
