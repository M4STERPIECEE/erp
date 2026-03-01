package com.erp.erp.adapter.in.web.controller;

import com.erp.erp.adapter.in.web.dto.request.CreateEmployeeRequest;
import com.erp.erp.adapter.in.web.dto.response.EmployeeResponse;
import com.erp.erp.adapter.in.web.mapper.EmployeeWebMapper;
import com.erp.erp.application.command.CreateEmployeCommand;
import com.erp.erp.application.result.EmployeResult;
import com.erp.erp.domain.port.in.employe.CreateEmployeUseCase;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/employes")
public class EmployeeController {

    private final CreateEmployeUseCase createEmployeUseCase;
    private final EmployeeWebMapper mapper;

    public EmployeeController(CreateEmployeUseCase createEmployeUseCase, EmployeeWebMapper mapper) {
        this.createEmployeUseCase = createEmployeUseCase;
        this.mapper = mapper;
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
