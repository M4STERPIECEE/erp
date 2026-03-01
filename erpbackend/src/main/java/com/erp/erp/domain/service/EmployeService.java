package com.erp.erp.domain.service;

import com.erp.erp.application.command.CreateEmployeCommand;
import com.erp.erp.application.result.EmployeResult;
import com.erp.erp.domain.model.Employe;
import com.erp.erp.domain.model.enums.StatutEmploye;
import com.erp.erp.domain.model.enums.TypeContrat;
import com.erp.erp.domain.port.in.employe.CreateEmployeUseCase;
import com.erp.erp.domain.port.out.EmployeRepositoryPort;
import com.erp.erp.domain.port.out.KeycloakPort;

import jakarta.transaction.Transactional;
import java.time.LocalDate;
import java.util.UUID;

public class EmployeService implements CreateEmployeUseCase {

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

    private String generateMatricule() {
        long count = employeRepositoryPort.compterEmployes();
        return String.format("EMP-%d-%04d", LocalDate.now().getYear(), count + 1);
    }
}
