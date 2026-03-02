package com.erp.erp.domain.model;

import java.time.LocalDateTime;

public class Departement {

    private Long id;
    private String nom;
    private String description;
    private Long responsableId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Transient enrichment fields (not persisted)
    private String responsableNom;
    private long nombreEmployes;

    public Departement() {}

    public Departement(Long id, String nom, String description, Long responsableId,
                       LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.nom = nom;
        this.description = description;
        this.responsableId = responsableId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Long getResponsableId() { return responsableId; }
    public void setResponsableId(Long responsableId) { this.responsableId = responsableId; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    public String getResponsableNom() { return responsableNom; }
    public void setResponsableNom(String responsableNom) { this.responsableNom = responsableNom; }
    public long getNombreEmployes() { return nombreEmployes; }
    public void setNombreEmployes(long nombreEmployes) { this.nombreEmployes = nombreEmployes; }
}
