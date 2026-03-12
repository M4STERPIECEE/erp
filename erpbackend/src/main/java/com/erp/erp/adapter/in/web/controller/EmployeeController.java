package com.erp.erp.adapter.in.web.controller;

import com.erp.erp.adapter.in.web.dto.request.CreateEmployeeRequest;
import com.erp.erp.adapter.in.web.dto.request.UpdateEmployeeRequest;
import com.erp.erp.domain.model.enums.ContractType;
import com.erp.erp.domain.model.enums.EmployeeStatus;
import com.erp.erp.infrastructure.exception.exceptions.EmployeeNotFoundException;
import com.erp.erp.infrastructure.exception.exceptions.UnauthorizedException;
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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/${version.path}/employees")
public class EmployeeController {
    private static final Logger log = LoggerFactory.getLogger(EmployeeController.class);
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
    @PreAuthorize("hasAnyRole('EMPLOYE', 'RH', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> myProfile() {
        String keycloakId = jwtTokenProvider.getCurrentUserId()
                .orElseThrow(() -> new UnauthorizedException("Utilisateur non authentifié (aucun subject dans le JWT)"));

        Employee employee = employeeRepositoryPort.findByKeycloakId(keycloakId)
                .or(() -> {
                    String email = jwtTokenProvider.getCurrentEmail().orElse(null);
                    if (email == null) return java.util.Optional.empty();
                    log.warn("Employee not found by keycloakId={}, trying email={}", keycloakId, email);
                    return employeeRepositoryPort.findByEmail(email)
                            .map(emp -> {
                                emp.setKeycloakId(UUID.fromString(keycloakId));
                                Employee synced = employeeRepositoryPort.save(emp);
                                log.info("Auto-synced keycloakId={} for employee id={} email={}", keycloakId, synced.getId(), email);
                                return synced;
                            });
                })
                .orElseThrow(() -> new EmployeeNotFoundException(
                        "Profil employé introuvable pour keycloakId=" + keycloakId));
        EmployeeRepositoryPort.ContractInfo contract = employeeRepositoryPort
                .findContractByEmployeeId(employee.getId()).orElse(null);

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
            departmentService.findById(employee.getDepartementId()).ifPresent(d ->
                result.put("departement", d.getNom())
            );
        }
        if (contract != null) {
            result.put("contractType", contract.type());
            result.put("salaireBase", contract.salaireBase());
            result.put("dateDebutContrat", contract.dateDebut());
            result.put("dateFinContrat", contract.dateFin());
        }
        return ResponseEntity.ok(result);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('RH', 'ADMIN', 'EMPLOYE')")
    public ResponseEntity<PagedEmployeeResponse> list(
            @RequestParam(defaultValue = "") String search,
            @RequestParam(required = false) Long department,
            @RequestParam(defaultValue = "") String statut,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        PageResult<EmployeeListResult> result = listEmployeesUseCase.list(search, department, statut, page, size);
        PagedEmployeeResponse response = mapper.toPagedResponse(result);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('RH', 'ADMIN')")
    public ResponseEntity<EmployeeResponse> create(@Valid @RequestBody CreateEmployeeRequest request) {
        CreateEmployeeCommand command = mapper.toCommand(request);
        EmployeeResult result = createEmployeeUseCase.create(command);
        EmployeeResponse response = mapper.toResponse(result);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('RH', 'ADMIN')")
    public ResponseEntity<EmployeeResponse> getById(@PathVariable Long id) {
        Employee employee = employeeRepositoryPort.findById(id)
                .orElseThrow(() -> new EmployeeNotFoundException("Employ\u00e9 introuvable : id=" + id));
        EmployeeRepositoryPort.ContractInfo contract = employeeRepositoryPort.findContractByEmployeeId(id).orElse(null);
        EmployeeListResult result = new EmployeeListResult(
                employee.getId(), employee.getKeycloakId(), employee.getMatricule(),
                employee.getNom(), employee.getPrenom(), employee.getEmail(),
                employee.getTelephone(), employee.getDateNaissance(), employee.getDateEmbauche(),
                employee.getPoste(), employee.getStatut() != null ? employee.getStatut().name() : null,
                employee.getDepartementId(),
                contract != null ? contract.type() : null,
                contract != null ? contract.salaireBase() : null
        );
        return ResponseEntity.ok(mapper.toResponseFromList(result));
    }

    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('RH', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> stats() {
        long total = employeeRepositoryPort.countEmployees();
        Map<ContractType, Long> distribution = employeeRepositoryPort.countByContractType();

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("totalEmployees", total);
        result.put("contractDistribution", distribution);
        return ResponseEntity.ok(result);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('RH', 'ADMIN')")
    public ResponseEntity<EmployeeResponse> update(@PathVariable Long id, @Valid @RequestBody UpdateEmployeeRequest request) {
        Employee employee = employeeRepositoryPort.findById(id)
                .orElseThrow(() -> new EmployeeNotFoundException("Employ\u00e9 introuvable : id=" + id));
        employee.setNom(request.nom());
        employee.setPrenom(request.prenom());
        employee.setTelephone(request.telephone());
        employee.setDateNaissance(request.dateNaissance());
        employee.setDateEmbauche(request.dateEmbauche());
        employee.setPoste(request.poste());
        if (request.statut() != null) {
            employee.setStatut(EmployeeStatus.valueOf(request.statut()));
        }
        employee.setDepartementId(request.departementId());
        Employee saved = employeeRepositoryPort.save(employee);
        if (request.contractType() != null && request.salaireBase() != null) {
            ContractType contractType = ContractType.valueOf(request.contractType());
            LocalDate dateFin = contractType == ContractType.CDI ? null : request.dateFinContrat();
            employeeRepositoryPort.updateContract(id, contractType, request.salaireBase(), dateFin);
        }
        EmployeeRepositoryPort.ContractInfo contract = employeeRepositoryPort.findContractByEmployeeId(id).orElse(null);
        EmployeeListResult result = new EmployeeListResult(
                saved.getId(), saved.getKeycloakId(), saved.getMatricule(),
                saved.getNom(), saved.getPrenom(), saved.getEmail(),
                saved.getTelephone(), saved.getDateNaissance(), saved.getDateEmbauche(),
                saved.getPoste(), saved.getStatut() != null ? saved.getStatut().name() : null,
                saved.getDepartementId(),
                contract != null ? contract.type() : null,
                contract != null ? contract.salaireBase() : null
        );
        return ResponseEntity.ok(mapper.toResponseFromList(result));
    }
}
