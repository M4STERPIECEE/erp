package com.erp.erp.domain.service;

import com.erp.erp.application.command.CreateEmployeCommand;
import com.erp.erp.application.result.EmployeListResult;
import com.erp.erp.application.result.EmployeResult;
import com.erp.erp.domain.model.Employe;
import com.erp.erp.domain.model.PageResult;
import com.erp.erp.domain.model.enums.StatutEmploye;
import com.erp.erp.domain.model.enums.TypeContrat;
import com.erp.erp.domain.port.in.employe.CreateEmployeUseCase;
import com.erp.erp.domain.port.in.employe.ListEmployesUseCase;
import com.erp.erp.domain.port.out.EmployeRepositoryPort;
import com.erp.erp.domain.port.out.EmployeRepositoryPort.ContratInfo;
import com.erp.erp.domain.port.out.KeycloakPort;

import jakarta.transaction.Transactional;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public class EmployeService implements CreateEmployeUseCase, ListEmployesUseCase {

    private final KeycloakPort keycloakPort;
    private final EmployeRepositoryPort employeRepositoryPort;

    public EmployeService(KeycloakPort keycloakPort, EmployeRepositoryPort employeRepositoryPort) {
        this.keycloakPort = keycloakPort;
        this.employeRepositoryPort = employeRepositoryPort;
    }

    @Override
    @Transactional
    public EmployeResult creer(CreateEmployeCommand command) {
        if (employeRepositoryPort.existeParEmail(command.email())) {
            throw new IllegalArgumentException("Un employé avec cet email existe déjà : " + command.email());
        }

        UUID keycloakId = keycloakPort.createUser(
                command.email(), command.nom(), command.prenom(), command.role()
        );

        String matricule = generateMatricule();

        Employe employe = new Employe();
        employe.setKeycloakId(keycloakId);
        employe.setMatricule(matricule);
        employe.setNom(command.nom());
        employe.setPrenom(command.prenom());
        employe.setEmail(command.email());
        employe.setTelephone(command.telephone());
        employe.setDateNaissance(command.dateNaissance());
        employe.setDateEmbauche(command.dateEmbauche());
        employe.setPoste(command.poste());
        employe.setStatut(StatutEmploye.ACTIF);
        employe.setDepartementId(command.departementId());

        Employe saved = employeRepositoryPort.sauvegarder(employe);

        TypeContrat typeContrat = TypeContrat.valueOf(command.typeContrat());
        LocalDate dateFin = typeContrat == TypeContrat.CDI ? null : command.dateEmbauche().plusYears(1);

        employeRepositoryPort.sauvegarderContrat(
                saved.getId(), typeContrat, command.salaireBase(), command.dateEmbauche(), dateFin
        );

        return new EmployeResult(
                saved.getId(),
                saved.getKeycloakId(),
                saved.getMatricule(),
                saved.getNom(),
                saved.getPrenom(),
                saved.getEmail(),
                saved.getTelephone(),
                saved.getDateNaissance(),
                saved.getDateEmbauche(),
                saved.getPoste(),
                saved.getStatut().name(),
                saved.getDepartementId(),
                command.typeContrat(),
                command.salaireBase()
        );
    }

    @Override
    public PageResult<EmployeListResult> lister(String search, Long departementId, String statut, int page, int size) {
        PageResult<Employe> pageResult = employeRepositoryPort.rechercherEmployes(search, departementId, statut, page, size);

        List<Long> employeIds = pageResult.content().stream().map(Employe::getId).toList();
        Map<Long, ContratInfo> contrats = employeRepositoryPort.trouverContratsPourEmployes(employeIds);

        List<EmployeListResult> results = pageResult.content().stream().map(emp -> {
            ContratInfo ci = contrats.get(emp.getId());
            return new EmployeListResult(
                    emp.getId(),
                    emp.getKeycloakId(),
                    emp.getMatricule(),
                    emp.getNom(),
                    emp.getPrenom(),
                    emp.getEmail(),
                    emp.getTelephone(),
                    emp.getDateNaissance(),
                    emp.getDateEmbauche(),
                    emp.getPoste(),
                    emp.getStatut() != null ? emp.getStatut().name() : null,
                    emp.getDepartementId(),
                    ci != null ? ci.type() : null,
                    ci != null ? ci.salaireBase() : null
            );
        }).toList();

        return new PageResult<>(results, pageResult.totalElements(), pageResult.totalPages(), pageResult.number(), pageResult.size());
    }

    private String generateMatricule() {
        long count = employeRepositoryPort.compterEmployes();
        return String.format("EMP-%d-%04d", LocalDate.now().getYear(), count + 1);
    }
}
