package com.erp.erp.adapter.in.web.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.time.LocalDate;

public record CreateEmployeeRequest(
        @NotBlank
        String nom,

        @NotBlank
        String prenom,

        @NotBlank
        @Email
        String email,
        String telephone,
        LocalDate dateNaissance,

        @NotNull
        LocalDate dateEmbauche,

        @NotBlank
        String poste,

        @NotNull
        Long departementId,

        @NotBlank
        String typeContrat,

        @NotNull @Positive
        BigDecimal salaireBase,

        @NotBlank
        String role
) {

}
