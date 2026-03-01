package com.erp.erp.domain.port.out;

import com.erp.erp.domain.model.Employe;
import com.erp.erp.domain.model.PageResult;
import com.erp.erp.domain.model.enums.TypeContrat;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public interface EmployeRepositoryPort {
    Employe sauvegarder(Employe employe);
    void sauvegarderContrat(Long employeId, TypeContrat type, BigDecimal salaireBase, LocalDate dateDebut, LocalDate dateFin);
    boolean existeParEmail(String email);
    long compterEmployes();
    PageResult<Employe> rechercherEmployes(String search, Long departementId, String statut, int page, int size);
    Map<Long, ContratInfo> trouverContratsPourEmployes(List<Long> employeIds);

    record ContratInfo(String type, BigDecimal salaireBase) {}
}
