package com.erp.erp.adapter.in.web.controller;

import com.erp.erp.adapter.in.web.dto.response.DepartmentResponse;
import com.erp.erp.domain.model.Department;
import com.erp.erp.domain.service.DepartmentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/departements")
public class DepartmentController {

    private final DepartmentService departmentService;

    public DepartmentController(DepartmentService departmentService) {
        this.departmentService = departmentService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('RH', 'ADMIN', 'Employee')")
    public ResponseEntity<List<DepartmentResponse>> lister() {
        List<Department> departements = departmentService.listerTous();
        List<DepartmentResponse> response = departements.stream()
                .map(this::toResponse)
                .toList();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('RH', 'ADMIN', 'Employee')")
    public ResponseEntity<DepartmentResponse> trouverParId(@PathVariable Long id) {
        return departmentService.trouverParId(id)
                .map(d -> ResponseEntity.ok(toResponse(d)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('RH', 'ADMIN')")
    public ResponseEntity<DepartmentResponse> creer(@RequestBody CreateDepartementRequest request) {
        Department dept = new Department();
        dept.setNom(request.nom());
        dept.setDescription(request.description());
        dept.setResponsableId(request.responsableId());
        Department saved = departmentService.creer(dept);
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(saved));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('RH', 'ADMIN')")
    public ResponseEntity<DepartmentResponse> modifier(@PathVariable Long id,
                                                       @RequestBody CreateDepartementRequest request) {
        Department updated = departmentService.modifier(id, request.nom(), request.description(), request.responsableId());
        return ResponseEntity.ok(toResponse(updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('RH', 'ADMIN')")
    public ResponseEntity<Void> supprimer(@PathVariable Long id) {
        departmentService.supprimer(id);
        return ResponseEntity.noContent().build();
    }

    private DepartmentResponse toResponse(Department d) {
        return new DepartmentResponse(
                d.getId(), d.getNom(), d.getDescription(),
                d.getResponsableId(), d.getResponsableNom(),
                d.getNombreEmployes()
        );
    }

    public record CreateDepartementRequest(String nom, String description, Long responsableId) {}
}
