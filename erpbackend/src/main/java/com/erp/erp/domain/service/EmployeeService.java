package com.erp.erp.domain.service;

import com.erp.erp.application.command.CreateEmployeeCommand;
import com.erp.erp.application.mapper.EmployeeServiceMapper;
import com.erp.erp.application.result.EmployeeListResult;
import com.erp.erp.application.result.EmployeeResult;
import com.erp.erp.domain.model.Employee;
import com.erp.erp.domain.model.PageResult;
import com.erp.erp.domain.model.enums.EmployeeStatus;
import com.erp.erp.domain.model.enums.ContractType;
import com.erp.erp.domain.port.in.employee.GetEmployeeByEmailUseCase;
import com.erp.erp.domain.port.in.employee.GetEmployeeByIdUseCase;
import com.erp.erp.domain.port.in.employee.GetEmployeeContractUseCase;
import com.erp.erp.domain.port.in.employee.GetEmployeeStatsUseCase;
import com.erp.erp.domain.port.in.employee.ListEmployeesUseCase;
import com.erp.erp.domain.port.out.EmployeeRepositoryPort;
import com.erp.erp.domain.port.out.EmployeeRepositoryPort.ContractInfo;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

public class EmployeeService implements ListEmployeesUseCase,
        GetEmployeeByEmailUseCase, GetEmployeeByIdUseCase, GetEmployeeContractUseCase, GetEmployeeStatsUseCase {

    private final EmployeeRepositoryPort employeeRepositoryPort;
    private final EmployeeServiceMapper mapper;

    public EmployeeService(EmployeeRepositoryPort employeeRepositoryPort) {
        this.employeeRepositoryPort = employeeRepositoryPort;
        this.mapper = new EmployeeServiceMapper();
    }

    public EmployeeResult create(CreateEmployeeCommand command) {
        if (employeeRepositoryPort.existsByEmail(command.email())) {
            throw new IllegalArgumentException("Un employé avec cet email existe déjà : " + command.email());
        }

        String matricule = generateMatricule();

        Employee employee = new Employee();
        employee.setMatricule(matricule);
        employee.setNom(command.nom());
        employee.setPrenom(command.prenom());
        employee.setEmail(command.email());
        employee.setTelephone(command.telephone());
        employee.setDateNaissance(command.dateNaissance());
        employee.setDateEmbauche(command.dateEmbauche());
        employee.setPoste(command.poste());
        employee.setStatut(EmployeeStatus.ACTIF);
        employee.setDepartementId(command.departementId());

        Employee saved = employeeRepositoryPort.save(employee);

        ContractType contractType = ContractType.valueOf(command.contractType());
        LocalDate dateFin = contractType == ContractType.CDI ? null : command.dateFinContrat();

        employeeRepositoryPort.saveContract(
                saved.getId(), contractType, command.salaireBase(), command.dateEmbauche(), dateFin);

        return mapper.toResult(saved, command.contractType(), command.salaireBase());
    }

    @Override
    public PageResult<EmployeeListResult> list(String search, Long departementId, String statut, int page, int size) {
        PageResult<Employee> pageResult = employeeRepositoryPort.searchEmployees(search, departementId, statut, page,
                size);

        List<Long> employeIds = pageResult.content().stream().map(Employee::getId).toList();
        Map<Long, ContractInfo> contrats = employeeRepositoryPort.findContractsForEmployees(employeIds);

        List<EmployeeListResult> results = pageResult.content().stream()
                .map(emp -> mapper.toListResult(emp, contrats.get(emp.getId())))
                .toList();

        return new PageResult<>(results, pageResult.totalElements(), pageResult.totalPages(), pageResult.number(),
                pageResult.size());
    }

    @Override
    public Optional<Employee> findByEmail(String email) {
        return employeeRepositoryPort.findByEmail(email);
    }

    @Override
    public Optional<Employee> findById(Long id) {
        return employeeRepositoryPort.findById(id);
    }

    @Override
    public Optional<ContractInfo> findContractByEmployeeId(Long employeeId) {
        return employeeRepositoryPort.findContractByEmployeeId(employeeId);
    }

    @Override
    public Map<ContractType, Long> countByContractType() {
        return employeeRepositoryPort.countByContractType();
    }

    private String generateMatricule() {
        return employeeRepositoryPort.generateNextMatricule(LocalDate.now().getYear());
    }
}
