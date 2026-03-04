package com.erp.erp.domain.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Department {

    private Long id;
    private String nom;
    private String description;
    private Long responsableId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Transient enrichment fields (not persisted)
    private String responsableNom;
    private long nombreEmployes;
}
