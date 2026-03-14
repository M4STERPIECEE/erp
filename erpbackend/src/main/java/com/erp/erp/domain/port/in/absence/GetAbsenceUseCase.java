package com.erp.erp.domain.port.in.absence;

import com.erp.erp.domain.model.Absence;

import java.util.List;

public interface GetAbsenceUseCase {
    List<Absence> listEmployeeAbsences(Long employeId, int mois, int annee);
}
