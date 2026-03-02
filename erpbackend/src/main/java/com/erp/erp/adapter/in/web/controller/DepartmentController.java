package com.erp.erp.adapter.in.web.controller;

import com.erp.erp.adapter.in.web.dto.response.DepartmentResponse;
import com.erp.erp.domain.model.Departement;
import com.erp.erp.domain.service.DepartementService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/departements")
public class DepartmentController {

    private final DepartementService departementService;

    public DepartmentController(DepartementService departementService) {
        this.departementService = departementService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('RH', 'ADMIN', 'EMPLOYE')")
    public ResponseEntity<List<DepartmentResponse>> lister() {
        List<Departement> departements = departementService.listerTous();
        List<DepartmentResponse> response = departements.stream()
                .map(this::toResponse)
                .toList();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('RH', 'ADMIN', 'EMPLOYE')")
    public ResponseEntity<DepartmentResponse> trouverParId(@PathVariable Long id) {
        return departementService.trouverParId(id)
                .map(d -> ResponseEntity.ok(toResponse(d)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('RH', 'ADMIN')")
    public ResponseEntity<DepartmentResponse> creer(@RequestBody CreateDepartementRequest request) {
        Departement dept = new Departement();
        dept.setNom(request.nom());
        dept.setDescription(request.description());
        dept.setResponsableId(request.responsableId());
        Departement saved = departementService.creer(dept);
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(saved));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('RH', 'ADMIN')")
    public ResponseEntity<DepartmentResponse> modifier(@PathVariable Long id,
                                                       @RequestBody CreateDepartementRequest request) {
        Departement updated = departementService.modifier(id, request.nom(), request.description(), request.responsableId());
        return ResponseEntity.ok(toResponse(updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('RH', 'ADMIN')")
    public ResponseEntity<Void> supprimer(@PathVariable Long id) {
        departementService.supprimer(id);
        return ResponseEntity.noContent().build();
    }

    private DepartmentResponse toResponse(Departement d) {
        return new DepartmentResponse(
                d.getId(), d.getNom(), d.getDescription(),
                d.getResponsableId(), d.getResponsableNom(),
                d.getNombreEmployes()
        );
    }

    public record CreateDepartementRequest(String nom, String description, Long responsableId) {}
}
