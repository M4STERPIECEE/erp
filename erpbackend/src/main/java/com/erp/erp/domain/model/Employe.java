package com.erp.erp.domain.model;

import com.erp.erp.domain.model.enums.StatutEmploye;
import java.time.LocalDate;
import java.util.UUID;

public class Employe {

    private Long id;
    private UUID keycloakId;
    private String matricule;
    private String nom;
    private String prenom;
    private String email;
    private String telephone;
    private LocalDate dateNaissance;
    private LocalDate dateEmbauche;
    private String poste;
    private StatutEmploye statut;
    private Long departementId;

    public Employe() {}

    public Employe(Long id, UUID keycloakId, String matricule, String nom, String prenom,
                   String email, String telephone, LocalDate dateNaissance, LocalDate dateEmbauche,
                   String poste, StatutEmploye statut, Long departementId) {
        this.id = id;
        this.keycloakId = keycloakId;
        this.matricule = matricule;
        this.nom = nom;
        this.prenom = prenom;
        this.email = email;
        this.telephone = telephone;
        this.dateNaissance = dateNaissance;
        this.dateEmbauche = dateEmbauche;
        this.poste = poste;
        this.statut = statut;
        this.departementId = departementId;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public UUID getKeycloakId() { return keycloakId; }
    public void setKeycloakId(UUID keycloakId) { this.keycloakId = keycloakId; }

    public String getMatricule() { return matricule; }
    public void setMatricule(String matricule) { this.matricule = matricule; }

    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }

    public String getPrenom() { return prenom; }
    public void setPrenom(String prenom) { this.prenom = prenom; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getTelephone() { return telephone; }
    public void setTelephone(String telephone) { this.telephone = telephone; }

    public LocalDate getDateNaissance() { return dateNaissance; }
    public void setDateNaissance(LocalDate dateNaissance) { this.dateNaissance = dateNaissance; }

    public LocalDate getDateEmbauche() { return dateEmbauche; }
    public void setDateEmbauche(LocalDate dateEmbauche) { this.dateEmbauche = dateEmbauche; }

    public String getPoste() { return poste; }
    public void setPoste(String poste) { this.poste = poste; }

    public StatutEmploye getStatut() { return statut; }
    public void setStatut(StatutEmploye statut) { this.statut = statut; }

    public Long getDepartementId() { return departementId; }
    public void setDepartementId(Long departementId) { this.departementId = departementId; }
}
