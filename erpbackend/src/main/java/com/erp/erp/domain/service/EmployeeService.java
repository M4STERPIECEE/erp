package com.erp.erp.domain.service;

import com.erp.erp.application.command.CreateEmployeeCommand;
import com.erp.erp.application.result.EmployeeListResult;
import com.erp.erp.application.result.EmployeeResult;
import com.erp.erp.domain.model.Employee;
import com.erp.erp.domain.model.PageResult;
import com.erp.erp.domain.model.enums.EmployeeStatus;
import com.erp.erp.domain.model.enums.ContractType;
import com.erp.erp.domain.port.in.employee.CreateEmployeeUseCase;
import com.erp.erp.domain.port.in.employee.ListEmployeesUseCase;
import com.erp.erp.domain.port.out.EmployeeRepositoryPort;
import com.erp.erp.domain.port.out.EmployeeRepositoryPort.ContractInfo;

import jakarta.transaction.Transactional;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public class EmployeeService implements CreateEmployeeUseCase, ListEmployeesUseCase {

    private final EmployeeRepositoryPort employeeRepositoryPort;

    public EmployeeService(EmployeeRepositoryPort employeeRepositoryPort) {
        this.employeeRepositoryPort = employeeRepositoryPort;
    }

    @Override
    @Transactional
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
                saved.getId(), contractType, command.salaireBase(), command.dateEmbauche(), dateFin
        );

        return new EmployeeResult(
                saved.getId(),
                saved.getMatricule(),
                saved.getNom(),
                saved.getPrenom(),
                saved.getEmail(),
                saved.getTelephone(),
                saved.getDateNaissance(),
                saved.getDateEmbauche(),
                saved.getPoste(),
                saved.getStatut().name(),
                saved.getDepartementId(),
                command.contractType(),
                command.salaireBase()
        );
    }

    @Override
    public PageResult<EmployeeListResult> list(String search, Long departementId, String statut, int page, int size) {
        PageResult<Employee> pageResult = employeeRepositoryPort.searchEmployees(search, departementId, statut, page, size);

        List<Long> employeIds = pageResult.content().stream().map(Employee::getId).toList();
        Map<Long, ContractInfo> contrats = employeeRepositoryPort.findContractsForEmployees(employeIds);

        List<EmployeeListResult> results = pageResult.content().stream().map(emp -> {
            ContractInfo ci = contrats.get(emp.getId());
            return new EmployeeListResult(
                    emp.getId(),
                    emp.getMatricule(),
                    emp.getNom(),
                    emp.getPrenom(),
                    emp.getEmail(),
                    emp.getTelephone(),
                    emp.getDateNaissance(),
                    emp.getDateEmbauche(),
                    emp.getPoste(),
                    emp.getStatut() != null ? emp.getStatut().name() : null,
                    emp.getDepartementId(),
                    ci != null ? ci.type() : null,
                    ci != null ? ci.salaireBase() : null
            );
        }).toList();

        return new PageResult<>(results, pageResult.totalElements(), pageResult.totalPages(), pageResult.number(), pageResult.size());
    }

    private String generateMatricule() {
        long count = employeeRepositoryPort.countEmployees();
        return String.format("EMP-%d-%04d", LocalDate.now().getYear(), count + 1);
    }
}
