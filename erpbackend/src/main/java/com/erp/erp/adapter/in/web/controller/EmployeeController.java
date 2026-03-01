package com.erp.erp.adapter.in.web.controller;

import com.erp.erp.adapter.in.web.dto.request.CreateEmployeeRequest;
import com.erp.erp.adapter.in.web.dto.response.EmployeeResponse;
import com.erp.erp.adapter.in.web.dto.response.PagedEmployeeResponse;
import com.erp.erp.adapter.in.web.mapper.EmployeeWebMapper;
import com.erp.erp.application.command.CreateEmployeCommand;
import com.erp.erp.application.result.EmployeListResult;
import com.erp.erp.application.result.EmployeResult;
import com.erp.erp.domain.model.PageResult;
import com.erp.erp.domain.port.in.employe.CreateEmployeUseCase;
import com.erp.erp.domain.port.in.employe.ListEmployesUseCase;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/employes")
public class EmployeeController {

    private final CreateEmployeUseCase createEmployeUseCase;
    private final ListEmployesUseCase listEmployesUseCase;
    private final EmployeeWebMapper mapper;

    public EmployeeController(CreateEmployeUseCase createEmployeUseCase,
                              ListEmployesUseCase listEmployesUseCase,
                              EmployeeWebMapper mapper) {
        this.createEmployeUseCase = createEmployeUseCase;
        this.listEmployesUseCase = listEmployesUseCase;
        this.mapper = mapper;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('RH', 'ADMIN', 'EMPLOYE')")
    public ResponseEntity<PagedEmployeeResponse> lister(
            @RequestParam(defaultValue = "") String search,
            @RequestParam(required = false) Long departement,
            @RequestParam(defaultValue = "") String statut,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        PageResult<EmployeListResult> result = listEmployesUseCase.lister(search, departement, statut, page, size);
        PagedEmployeeResponse response = mapper.toPagedResponse(result);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('RH', 'ADMIN')")
    public ResponseEntity<EmployeeResponse> creer(@Valid @RequestBody CreateEmployeeRequest request) {
        CreateEmployeCommand command = mapper.toCommand(request);
        EmployeResult result = createEmployeUseCase.creer(command);
        EmployeeResponse response = mapper.toResponse(result);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
