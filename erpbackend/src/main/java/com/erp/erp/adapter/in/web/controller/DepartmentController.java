package com.erp.erp.adapter.in.web.controller;

import com.erp.erp.adapter.in.web.dto.request.CreateDepartementRequest;
import com.erp.erp.adapter.in.web.dto.response.DepartmentResponse;
import com.erp.erp.adapter.in.web.mapper.DepartmentWebMapper;
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
    private final DepartmentWebMapper mapper;

    public DepartmentController(GetDepartmentUseCase getDepartmentUseCase,
                                CreateDepartmentUseCase createDepartmentUseCase,
                                UpdateDepartmentUseCase updateDepartmentUseCase,
                                DepartmentWebMapper mapper) {
        this.getDepartmentUseCase = getDepartmentUseCase;
        this.createDepartmentUseCase = createDepartmentUseCase;
        this.updateDepartmentUseCase = updateDepartmentUseCase;
        this.mapper = mapper;
    }

    @GetMapping
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<List<DepartmentResponse>> list() {
        List<Department> departements = getDepartmentUseCase.listAll();
        List<DepartmentResponse> response = departements.stream()
                .map(mapper::toResponse)
                .toList();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<DepartmentResponse> findById(@PathVariable Long id) {
        return getDepartmentUseCase.findById(id)
                .map(d -> ResponseEntity.ok(mapper.toResponse(d)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<DepartmentResponse> create(@RequestBody CreateDepartementRequest request) {
        Department dept = new Department();
        dept.setNom(request.nom());
        dept.setDescription(request.description());
        dept.setResponsableId(request.responsableId());
        Department saved = createDepartmentUseCase.create(dept);
        return ResponseEntity.status(HttpStatus.CREATED).body(mapper.toResponse(saved));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<DepartmentResponse> update(@PathVariable Long id,
                                                       @RequestBody CreateDepartementRequest request) {
        Department updated = updateDepartmentUseCase.update(id, request.nom(), request.description(), request.responsableId());
        return ResponseEntity.ok(mapper.toResponse(updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        updateDepartmentUseCase.delete(id);
        return ResponseEntity.noContent().build();
    }

    }
