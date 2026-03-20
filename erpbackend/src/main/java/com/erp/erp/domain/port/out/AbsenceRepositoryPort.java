package com.erp.erp.domain.port.out;

import com.erp.erp.domain.model.Absence;

import java.util.List;

public interface AbsenceRepositoryPort {
    List<Absence> findByEmployeeIdAndMonth(Long employeId, int mois, int annee);
    int countAbsencesCurrentMonth(Long employeId, int mois, int annee);
}
