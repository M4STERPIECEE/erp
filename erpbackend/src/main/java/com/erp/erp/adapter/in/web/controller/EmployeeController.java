package com.erp.erp.adapter.in.web.controller;

import com.erp.erp.adapter.in.web.dto.request.CreateEmployeeRequest;
import com.erp.erp.adapter.in.web.dto.response.EmployeeResponse;
import com.erp.erp.adapter.in.web.dto.response.PagedEmployeeResponse;
import com.erp.erp.adapter.in.web.mapper.EmployeeWebMapper;
import com.erp.erp.application.command.CreateEmployeeCommand;
import com.erp.erp.application.result.EmployeeListResult;
import com.erp.erp.application.result.EmployeeResult;
import com.erp.erp.domain.model.Employee;
import com.erp.erp.domain.model.PageResult;
import com.erp.erp.domain.port.in.employee.CreateEmployeeUseCase;
import com.erp.erp.domain.port.in.employee.ListEmployeesUseCase;
import com.erp.erp.domain.port.out.EmployeeRepositoryPort;
import com.erp.erp.domain.service.DepartmentService;
import com.erp.erp.infrastructure.security.JwtTokenProvider;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/employes")
public class EmployeeController {

    private final CreateEmployeeUseCase createEmployeeUseCase;
    private final ListEmployeesUseCase listEmployeesUseCase;
    private final EmployeeWebMapper mapper;
    private final EmployeeRepositoryPort employeeRepositoryPort;
    private final DepartmentService departmentService;
    private final JwtTokenProvider jwtTokenProvider;

    public EmployeeController(CreateEmployeeUseCase createEmployeeUseCase,
                              ListEmployeesUseCase listEmployeesUseCase,
                              EmployeeWebMapper mapper,
                              EmployeeRepositoryPort employeeRepositoryPort,
                              DepartmentService departmentService,
                              JwtTokenProvider jwtTokenProvider) {
        this.createEmployeeUseCase = createEmployeeUseCase;
        this.listEmployeesUseCase = listEmployeesUseCase;
        this.mapper = mapper;
        this.employeeRepositoryPort = employeeRepositoryPort;
        this.departmentService = departmentService;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @GetMapping("/me")
    @PreAuthorize("hasAnyRole('Employee', 'RH', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> monProfil() {
        String keycloakId = jwtTokenProvider.getCurrentUserId()
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur non authentifié"));

        Employee employee = employeeRepositoryPort.trouverParKeycloakId(keycloakId)
                .orElseThrow(() -> new IllegalArgumentException("Profil employé introuvable"));

        EmployeeRepositoryPort.ContratInfo contract = employeeRepositoryPort
                .trouverContratParEmployeId(employee.getId()).orElse(null);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("id", employee.getId());
        result.put("matricule", employee.getMatricule());
        result.put("nom", employee.getNom());
        result.put("prenom", employee.getPrenom());
        result.put("email", employee.getEmail());
        result.put("telephone", employee.getTelephone());
        result.put("poste", employee.getPoste());
        result.put("dateEmbauche", employee.getDateEmbauche());
        result.put("dateNaissance", employee.getDateNaissance());
        result.put("statut", employee.getStatut() != null ? employee.getStatut().name() : null);

        if (employee.getDepartementId() != null) {
            departmentService.trouverParId(employee.getDepartementId()).ifPresent(d -> {
                Map<String, Object> dept = new LinkedHashMap<>();
                dept.put("id", d.getId());
                dept.put("nom", d.getNom());
                dept.put("responsableNom", d.getResponsableNom());
                result.put("department", dept);
            });
        }

        if (contract != null) {
            Map<String, Object> contratMap = new LinkedHashMap<>();
            contratMap.put("type", contract.type());
            contratMap.put("dateDebut", contract.dateDebut());
            contratMap.put("dateFin", contract.dateFin());
            contratMap.put("salaireBase", contract.salaireBase());
            result.put("contract", contratMap);
        }

        return ResponseEntity.ok(result);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('RH', 'ADMIN', 'Employee')")
    public ResponseEntity<PagedEmployeeResponse> lister(
            @RequestParam(defaultValue = "") String search,
            @RequestParam(required = false) Long department,
            @RequestParam(defaultValue = "") String statut,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        PageResult<EmployeeListResult> result = listEmployeesUseCase.lister(search, department, statut, page, size);
        PagedEmployeeResponse response = mapper.toPagedResponse(result);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('RH', 'ADMIN')")
    public ResponseEntity<EmployeeResponse> creer(@Valid @RequestBody CreateEmployeeRequest request) {
        CreateEmployeeCommand command = mapper.toCommand(request);
        EmployeeResult result = createEmployeeUseCase.creer(command);
        EmployeeResponse response = mapper.toResponse(result);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
