package com.erp.erp.domain.model;

import com.erp.erp.domain.model.enums.EmployeeStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Employee {

    private Long id;
    private String matricule;
    private String nom;
    private String prenom;
    private String email;
    private String telephone;
    private LocalDate dateNaissance;
    private LocalDate dateEmbauche;
    private String poste;
    private EmployeeStatus statut;
    private Long departementId;
}
