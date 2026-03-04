package com.erp.erp.domain.port.out;

import com.erp.erp.domain.model.Leave;

import java.util.List;
import java.util.Optional;

public interface LeaveRepositoryPort {
    Leave sauvegarder(Leave leave);
    Optional<Leave> trouverParId(Long id);
    List<Leave> trouverParEmployeId(Long employeId);
    void supprimer(Long id);
    int compterJoursCongesApprouvesCetteAnnee(Long employeId, int annee);
    int compterDemandesEnAttente(Long employeId);
}
