package com.erp.erp.adapter.in.web.controller;

import com.erp.erp.adapter.in.web.dto.request.CreateEmployeeRequest;
import com.erp.erp.adapter.in.web.dto.request.UpdateEmployeeRequest;
import com.erp.erp.domain.model.enums.ContractType;
import com.erp.erp.domain.model.enums.EmployeeStatus;
import com.erp.erp.domain.exception.EmployeeNotFoundException;
import com.erp.erp.domain.exception.UnauthorizedException;
import com.erp.erp.adapter.in.web.dto.response.EmployeeResponse;
import com.erp.erp.adapter.in.web.dto.response.EmployeeStatsResponse;
import com.erp.erp.adapter.in.web.dto.response.PagedEmployeeResponse;
import com.erp.erp.adapter.in.web.dto.response.ProfileResponse;
import com.erp.erp.adapter.in.web.mapper.EmployeeWebMapper;
import com.erp.erp.application.command.CreateEmployeeCommand;
import com.erp.erp.application.result.EmployeeListResult;
import com.erp.erp.application.result.EmployeeResult;
import com.erp.erp.domain.model.Department;
import com.erp.erp.domain.model.Employee;
import com.erp.erp.domain.model.PageResult;
import com.erp.erp.domain.port.in.employee.CreateEmployeeUseCase;
import com.erp.erp.domain.port.in.employee.GetEmployeeByEmailUseCase;
import com.erp.erp.domain.port.in.employee.GetEmployeeByIdUseCase;
import com.erp.erp.domain.port.in.employee.GetEmployeeContractUseCase;
import com.erp.erp.domain.port.in.employee.GetEmployeeStatsUseCase;
import com.erp.erp.domain.port.in.employee.ListEmployeesUseCase;
import com.erp.erp.domain.port.out.EmployeeRepositoryPort;
import com.erp.erp.domain.port.out.EmployeeRepositoryPort.ContractInfo;
import com.erp.erp.domain.service.DepartmentService;
import com.erp.erp.infrastructure.security.JwtTokenProvider;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/${version.path}/employees")
public class EmployeeController {
    private final CreateEmployeeUseCase createEmployeeUseCase;
    private final ListEmployeesUseCase listEmployeesUseCase;
    private final GetEmployeeByEmailUseCase getEmployeeByEmailUseCase;
    private final GetEmployeeByIdUseCase getEmployeeByIdUseCase;
    private final GetEmployeeContractUseCase getEmployeeContractUseCase;
    private final GetEmployeeStatsUseCase getEmployeeStatsUseCase;
    private final EmployeeWebMapper employeeWebMapper;
    private final EmployeeRepositoryPort employeeRepositoryPort;
    private final DepartmentService departmentService;
    private final JwtTokenProvider jwtTokenProvider;

    public EmployeeController(CreateEmployeeUseCase createEmployeeUseCase,
            ListEmployeesUseCase listEmployeesUseCase,
            GetEmployeeByEmailUseCase getEmployeeByEmailUseCase,
            GetEmployeeByIdUseCase getEmployeeByIdUseCase,
            GetEmployeeContractUseCase getEmployeeContractUseCase,
            GetEmployeeStatsUseCase getEmployeeStatsUseCase,
            EmployeeWebMapper employeeWebMapper,
            EmployeeRepositoryPort employeeRepositoryPort,
            DepartmentService departmentService,
            JwtTokenProvider jwtTokenProvider) {
        this.createEmployeeUseCase = createEmployeeUseCase;
        this.listEmployeesUseCase = listEmployeesUseCase;
        this.getEmployeeByEmailUseCase = getEmployeeByEmailUseCase;
        this.getEmployeeByIdUseCase = getEmployeeByIdUseCase;
        this.getEmployeeContractUseCase = getEmployeeContractUseCase;
        this.getEmployeeStatsUseCase = getEmployeeStatsUseCase;
        this.employeeWebMapper = employeeWebMapper;
        this.employeeRepositoryPort = employeeRepositoryPort;
        this.departmentService = departmentService;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ProfileResponse> myProfile() {
        String email = jwtTokenProvider.getCurrentEmail()
                .orElseThrow(
                        () -> new UnauthorizedException("Utilisateur non authentifié (aucun subject dans le JWT)"));

        Employee employee = getEmployeeByEmailUseCase.findByEmail(email)
                .orElseThrow(() -> new EmployeeNotFoundException(
                        "Profil employé introuvable pour email=" + email));
        ContractInfo contract = getEmployeeContractUseCase.findContractByEmployeeId(employee.getId()).orElse(null);
        String departementNom = employee.getDepartementId() != null
                ? departmentService.findById(employee.getDepartementId()).map(Department::getNom).orElse(null)
                : null;

        return ResponseEntity.ok(employeeWebMapper.toProfileResponse(employee, contract, departementNom));
    }

    @GetMapping
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<PagedEmployeeResponse> list(
            @RequestParam(defaultValue = "") String search,
            @RequestParam(required = false) Long department,
            @RequestParam(defaultValue = "") String statut,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        PageResult<EmployeeListResult> result = listEmployeesUseCase.list(search, department, statut, page, size);
        PagedEmployeeResponse response = employeeWebMapper.toPagedResponse(result);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<EmployeeResponse> create(@Valid @RequestBody CreateEmployeeRequest request) {
        CreateEmployeeCommand command = employeeWebMapper.toCommand(request);
        EmployeeResult result = createEmployeeUseCase.create(command);
        EmployeeResponse response = employeeWebMapper.toResponse(result);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<EmployeeResponse> getById(@PathVariable Long id) {
        Employee employee = getEmployeeByIdUseCase.findById(id)
                .orElseThrow(() -> new EmployeeNotFoundException("Employ\u00e9 introuvable : id=" + id));
        ContractInfo contract = getEmployeeContractUseCase.findContractByEmployeeId(id).orElse(null);
        return ResponseEntity.ok(employeeWebMapper.toEmployeeResponse(employee, contract));
    }

    @GetMapping("/stats")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<EmployeeStatsResponse> stats() {
        long total = listEmployeesUseCase.list("", null, "", 0, 1).totalElements();
        Map<ContractType, Long> distribution = getEmployeeStatsUseCase.countByContractType();
        return ResponseEntity.ok(employeeWebMapper.toStatsResponse(total, distribution));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<EmployeeResponse> update(@PathVariable Long id,
            @Valid @RequestBody UpdateEmployeeRequest request) {
        Employee employee = getEmployeeByIdUseCase.findById(id)
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
        ContractInfo contract = getEmployeeContractUseCase.findContractByEmployeeId(id).orElse(null);
        return ResponseEntity.ok(employeeWebMapper.toEmployeeResponse(saved, contract));
    }
}
