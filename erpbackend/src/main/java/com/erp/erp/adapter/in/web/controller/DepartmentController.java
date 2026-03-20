package com.erp.erp.adapter.in.web.controller;

import com.erp.erp.adapter.in.web.dto.response.DepartmentResponse;
import com.erp.erp.domain.model.Department;
import com.erp.erp.domain.port.in.department.CreateDepartmentUseCase;
import com.erp.erp.domain.port.in.department.GetDepartmentUseCase;
import com.erp.erp.domain.port.in.department.UpdateDepartmentUseCase;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/${version.path}/departments")
public class DepartmentController {

    private final GetDepartmentUseCase getDepartmentUseCase;
    private final CreateDepartmentUseCase createDepartmentUseCase;
    private final UpdateDepartmentUseCase updateDepartmentUseCase;

    public DepartmentController(GetDepartmentUseCase getDepartmentUseCase,
                                CreateDepartmentUseCase createDepartmentUseCase,
                                UpdateDepartmentUseCase updateDepartmentUseCase) {
        this.getDepartmentUseCase = getDepartmentUseCase;
        this.createDepartmentUseCase = createDepartmentUseCase;
        this.updateDepartmentUseCase = updateDepartmentUseCase;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('RH', 'ADMIN', 'EMPLOYE')")
    public ResponseEntity<List<DepartmentResponse>> list() {
        List<Department> departements = getDepartmentUseCase.listAll();
        List<DepartmentResponse> response = departements.stream()
                .map(this::toResponse)
                .toList();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('RH', 'ADMIN', 'EMPLOYE')")
    public ResponseEntity<DepartmentResponse> findById(@PathVariable Long id) {
        return getDepartmentUseCase.findById(id)
                .map(d -> ResponseEntity.ok(toResponse(d)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('RH', 'ADMIN')")
    public ResponseEntity<DepartmentResponse> create(@RequestBody CreateDepartementRequest request) {
        Department dept = new Department();
        dept.setNom(request.nom());
        dept.setDescription(request.description());
        dept.setResponsableId(request.responsableId());
        Department saved = createDepartmentUseCase.create(dept);
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(saved));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('RH', 'ADMIN')")
    public ResponseEntity<DepartmentResponse> update(@PathVariable Long id,
                                                       @RequestBody CreateDepartementRequest request) {
        Department updated = updateDepartmentUseCase.update(id, request.nom(), request.description(), request.responsableId());
        return ResponseEntity.ok(toResponse(updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('RH', 'ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        updateDepartmentUseCase.delete(id);
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
