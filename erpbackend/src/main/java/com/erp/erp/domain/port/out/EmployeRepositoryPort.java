package com.erp.erp.domain.port.out;

import com.erp.erp.domain.model.Employe;
import com.erp.erp.domain.model.enums.TypeContrat;

import java.math.BigDecimal;
import java.time.LocalDate;

public interface EmployeRepositoryPort {
    Employe sauvegarder(Employe employe);
    void sauvegarderContrat(Long employeId, TypeContrat type, BigDecimal salaireBase, LocalDate dateDebut, LocalDate dateFin);
    boolean existeParEmail(String email);
    long compterEmployes();
}
