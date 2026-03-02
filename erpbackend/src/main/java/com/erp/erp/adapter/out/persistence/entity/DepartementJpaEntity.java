package com.erp.erp.adapter.out.persistence.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "departement")
public class DepartementJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String nom;

    @Column(columnDefinition = "CLOB")
    private String description;

    @Column(name = "responsable_id")
    private Long responsableId;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
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
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
