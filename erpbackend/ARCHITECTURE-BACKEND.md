# ERP Backend — Architecture Documentation

## 1. Project Overview

This is the backend for an **Enterprise Resource Planning (ERP)** system built with **Spring Boot 4.0.3** and **Java 21**. It manages employees, departments, leaves (vacation/time-off), absences, payroll/payslips, authentication/authorization, and related business workflows.

The application follows a **Hexagonal Architecture** (Ports & Adapters) to keep domain logic isolated from framework concerns, enabling testability and maintainability.

---

## 2. Tech Stack

| Technology | Version / Detail |
|---|---|
| **Java** | 21 |
| **Spring Boot** | 4.0.3 |
| **Spring Data JPA** | Hibernate ORM |
| **Spring Security** | Role-based access + JWT |
| **Spring Validation** | Jakarta Bean Validation |
| **PostgreSQL** | Database |
| **JWT (jjwt)** | 0.12.5 (io.jsonwebtoken) |
| **MapStruct** | 1.6.3 (object mapping) |
| **Lombok** | Boilerplate reduction |
| **Gradle** | Build tool (Groovy DSL) |
| **JUnit 5** | Testing |

## 3. Architecture — Hexagonal (Ports & Adapters)

### Layer Responsibilities

| Layer | Responsibility |
|---|---|
| **Domain** | Enterprise business logic, domain models, port interfaces (contracts). |
| **Application** | Simple command/result records that cross the boundary between adapters and domain. |
| **Adapter In** | Inbound adapters: REST controllers, request/response DTOs, web mappers, exception handler. |
| **Adapter Out** | Outbound adapters: JPA persistence, email notifications, PDF generation. |
| **Infrastructure** | Security (JWT, filters), configuration, global exceptions, data seeding. |

### Dependency Rule

Dependencies point **inward**:
- **Adapter In** → **Application** → **Domain** (port **in** interfaces)
- **Adapter Out** implements **Domain** (port **out** interfaces)
- **Infrastructure** can be used by any layer (but domain never depends on infrastructure)


## 4. Project Structure

```
erpbackend/
├── build.gradle
├── settings.gradle
├── src/main/
│   ├── java/com/erp/erp/
│   │   ├── ErpApplication.java
│   │   ├── adapter/in/web/controller/    (6 controllers)
│   │   ├── adapter/in/web/dto/request/    (7 request DTOs)
│   │   ├── adapter/in/web/dto/response/   (8 response DTOs)
│   │   ├── adapter/in/web/mapper/         (4 mappers)
│   │   ├── adapter/in/web/exception/      (GlobalExceptionHandler)
│   │   ├── adapter/out/persistence/entity/    (6 entities)
│   │   ├── adapter/out/persistence/repository/(8 repositories)
│   │   ├── adapter/out/persistence/mapper/    (3 mappers)
│   │   ├── adapter/out/persistence/adapter/   (5 adapters)
│   │   ├── adapter/out/notification/     (1 placeholder)
│   │   ├── adapter/out/pdf/              (1 placeholder)
│   │   ├── application/command/          (5 commands)
│   │   ├── application/result/           (6 results)
│   │   ├── domain/model/                 (8 models + 5 enums)
│   │   ├── domain/port/in/               (14 use case interfaces)
│   │   ├── domain/port/out/              (7 port interfaces)
│   │   ├── domain/service/               (5 services)
│   │   ├── infrastructure/config/        (4 configs)
│   │   ├── infrastructure/security/      (4 security classes)
│   │   └── infrastructure/exception/     (5 exceptions)
│   └── resources/
│       ├── application.yaml
│       └── banner.txt
└── build.gradle
```

## 5. Domain Layer


### Domain Models

#### `domain/model/Leave.java`

```java
package com.erp.erp.domain.model;

import com.erp.erp.domain.model.enums.LeaveStatus;
import com.erp.erp.domain.model.enums.LeaveType;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Leave {
    private Long id;
    private Long employeId;
    private Long approbateurId;
    private LeaveType type;
    private LocalDate dateDebut;
    private LocalDate dateFin;
    private int nombreJours;
    private LeaveStatus statut;
    private String motif;
    private LocalDateTime createdAt;

    public static int calculateBusinessDays(LocalDate debut, LocalDate fin) {
        int jours = 0;
        LocalDate date = debut;
        while (!date.isAfter(fin)) {
            DayOfWeek dow = date.getDayOfWeek();
            if (dow != DayOfWeek.SATURDAY && dow != DayOfWeek.SUNDAY) {
                jours++;
            }
            date = date.plusDays(1);
        }
        return jours;
    }

    public static Leave create(Long employeId, String type, LocalDate dateDebut, LocalDate dateFin, String motif) {
        if (dateFin.isBefore(dateDebut)) {
            throw new IllegalArgumentException("La date de fin doit être après la date de début");
        }
        int nombreJours = calculateBusinessDays(dateDebut, dateFin);
        if (nombreJours <= 0) {
            throw new IllegalArgumentException("La période sélectionnée ne contient aucun jour ouvrable");
        }
        Leave leave = new Leave();
        leave.setEmployeId(employeId);
        leave.setType(LeaveType.valueOf(type));
        leave.setDateDebut(dateDebut);
        leave.setDateFin(dateFin);
        leave.setNombreJours(nombreJours);
        leave.setStatut(LeaveStatus.EN_ATTENTE);
        leave.setMotif(motif);
        return leave;
    }
}
```


### Enums

#### `domain/model/enums/ContractType.java`

```java
package com.erp.erp.domain.model.enums;

public enum ContractType {
    CDI, CDD, STAGE, FREELANCE
}
```

#### `domain/model/enums/EmployeeStatus.java`

```java
package com.erp.erp.domain.model.enums;

public enum EmployeeStatus {
    ACTIF, INACTIF, SUSPENDU
}
```

#### `domain/model/enums/LeaveStatus.java`

```java
package com.erp.erp.domain.model.enums;

public enum LeaveStatus {
    EN_ATTENTE,
    APPROUVE,
    REJETE
}
```

#### `domain/model/enums/LeaveType.java`

```java
package com.erp.erp.domain.model.enums;

public enum LeaveType {
    ANNUEL,
    MALADIE,
    MATERNITE,
    SANS_SOLDE
}
```

#### `domain/model/enums/PayslipStatus.java`

```java
package com.erp.erp.domain.model.enums;

public enum PayslipStatus {
    BROUILLON,
    VALIDEE,
    PAYEE
}
```


### Port In Interfaces (Use Cases)

#### `domain/port/in/absence/GetAbsenceUseCase.java`

```java
package com.erp.erp.domain.port.in.absence;

import com.erp.erp.domain.model.Absence;

import java.util.List;

public interface GetAbsenceUseCase {
    List<Absence> listEmployeeAbsences(Long employeId, int mois, int annee);
}
```

#### `domain/port/in/absence/RegisterAbsenceUseCase.java`

```java
package com.erp.erp.domain.port.in.absence;
```

#### `domain/port/in/department/CreateDepartmentUseCase.java`

```java
package com.erp.erp.domain.port.in.department;

import com.erp.erp.domain.model.Department;

public interface CreateDepartmentUseCase {
    Department create(Department department);
}
```

#### `domain/port/in/department/GetDepartmentUseCase.java`

```java
package com.erp.erp.domain.port.in.department;

import com.erp.erp.domain.model.Department;

import java.util.List;
import java.util.Optional;

public interface GetDepartmentUseCase {
    List<Department> listAll();
    Optional<Department> findById(Long id);
}
```

#### `domain/port/in/department/UpdateDepartmentUseCase.java`

```java
package com.erp.erp.domain.port.in.department;

import com.erp.erp.domain.model.Department;

public interface UpdateDepartmentUseCase {
    Department update(Long id, String nom, String description, Long responsableId);
    void delete(Long id);
}
```

#### `domain/port/in/employee/CreateEmployeeUseCase.java`

```java
package com.erp.erp.domain.port.in.employee;

import com.erp.erp.application.command.CreateEmployeeCommand;
import com.erp.erp.application.result.EmployeeResult;

public interface CreateEmployeeUseCase {
    EmployeeResult create(CreateEmployeeCommand command);
}
```

#### `domain/port/in/employee/DeleteEmployeeUseCase.java`

```java
package com.erp.erp.domain.port.in.employee;
```

#### `domain/port/in/employee/GetEmployeeUseCase.java`

```java
package com.erp.erp.domain.port.in.employee;
```

#### `domain/port/in/employee/ListEmployeesUseCase.java`

```java
package com.erp.erp.domain.port.in.employee;

import com.erp.erp.application.result.EmployeeListResult;
import com.erp.erp.domain.model.PageResult;

public interface ListEmployeesUseCase {
    PageResult<EmployeeListResult> list(String search, Long departementId, String statut, int page, int size);
}
```

#### `domain/port/in/employee/UpdateEmployeeUseCase.java`

```java
package com.erp.erp.domain.port.in.employee;
```

#### `domain/port/in/leave/ApproveLeaveUseCase.java`

```java
package com.erp.erp.domain.port.in.leave;

import com.erp.erp.domain.model.Leave;

public interface ApproveLeaveUseCase {
    Leave approveLeave(Long id, Long approbateurId);
}
```

#### `domain/port/in/leave/GetLeaveUseCase.java`

```java
package com.erp.erp.domain.port.in.leave;

import com.erp.erp.application.result.AdminLeaveResult;
import com.erp.erp.domain.model.Leave;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface GetLeaveUseCase {
    List<Leave> listEmployeeLeaves(Long employeId);
    List<Leave> listAllLeavesFiltered(String statut);
    List<AdminLeaveResult> searchLeaves(String statut, String search, Long departementId,
                                       LocalDate dateDebut, LocalDate dateFin);
    Optional<Leave> findById(Long id);
    int countLeaveDaysTakenThisYear(Long employeId);
    int countPendingRequests(Long employeId);
    int countAllPending();
    int countAllApproved();
    int countOnLeaveToday();
    int countPlannedThisMonth();
}
```

#### `domain/port/in/leave/RejectLeaveUseCase.java`

```java
package com.erp.erp.domain.port.in.leave;

import com.erp.erp.domain.model.Leave;

public interface RejectLeaveUseCase {
    Leave rejectLeave(Long id, Long approbateurId);
}
```

#### `domain/port/in/leave/RequestLeaveUseCase.java`

```java
package com.erp.erp.domain.port.in.leave;

import com.erp.erp.domain.model.Leave;

import java.time.LocalDate;

public interface RequestLeaveUseCase {
    Leave requestLeave(Long employeId, String type, LocalDate dateDebut, LocalDate dateFin, String motif);
    void cancelLeave(Long id, Long employeId);
}
```

#### `domain/port/in/payroll/CalculatePayrollUseCase.java`

```java
package com.erp.erp.domain.port.in.payroll;
```

#### `domain/port/in/payroll/GeneratePayslipPdfUseCase.java`

```java
package com.erp.erp.domain.port.in.payroll;
```

#### `domain/port/in/payroll/ValidatePayslipUseCase.java`

```java
package com.erp.erp.domain.port.in.payroll;
```


### Port Out Interfaces (SPIs)

#### `domain/port/out/AbsenceRepositoryPort.java`

```java
package com.erp.erp.domain.port.out;

import com.erp.erp.domain.model.Absence;

import java.util.List;

public interface AbsenceRepositoryPort {
    List<Absence> findByEmployeeIdAndMonth(Long employeId, int mois, int annee);
    int countAbsencesCurrentMonth(Long employeId, int mois, int annee);
}
```

#### `domain/port/out/DepartmentRepositoryPort.java`

```java
package com.erp.erp.domain.port.out;

import com.erp.erp.domain.model.Department;

import java.util.List;
import java.util.Optional;

public interface DepartmentRepositoryPort {
    List<Department> findAll();
    Optional<Department> findById(Long id);
    Department save(Department department);
    void deleteById(Long id);
    /** Retourne tous les départements enrichis (responsableNom + nombreEmployes) en une seule requête. */
    List<Department> findAllWithStats();
    /** Retourne un département enrichi par ID en une seule requête. */
    Optional<Department> findByIdWithStats(Long id);
}
```

#### `domain/port/out/EmployeeRepositoryPort.java`

```java
package com.erp.erp.domain.port.out;

import com.erp.erp.domain.model.Employee;
import com.erp.erp.domain.model.PageResult;
import com.erp.erp.domain.model.enums.ContractType;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface EmployeeRepositoryPort {
    Employee save(Employee employee);
    void saveContract(Long employeId, ContractType type, BigDecimal salaireBase, LocalDate dateDebut, LocalDate dateFin);
    void updateContract(Long employeId, ContractType type, BigDecimal salaireBase, LocalDate dateFin);
    boolean existsByEmail(String email);
    /** Génère le prochain matricule de façon atomique, sans race condition. */
    String generateNextMatricule(int year);
    Map<ContractType, Long> countByContractType();
    PageResult<Employee> searchEmployees(String search, Long departementId, String statut, int page, int size);
    Map<Long, ContractInfo> findContractsForEmployees(List<Long> employeIds);

    Optional<Employee> findByEmail(String email);
    Optional<Employee> findById(Long id);
    List<Employee> findAllByIds(List<Long> ids);
    Optional<ContractInfo> findContractByEmployeeId(Long employeId);

    record ContractInfo(String type, BigDecimal salaireBase, LocalDate dateDebut, LocalDate dateFin) {}
}
```

#### `domain/port/out/LeaveRepositoryPort.java`

```java
package com.erp.erp.domain.port.out;

import com.erp.erp.domain.model.Leave;

import java.util.List;
import java.util.Optional;

public interface LeaveRepositoryPort {
    Leave save(Leave leave);
    Optional<Leave> findById(Long id);
    List<Leave> findAll();
    List<Leave> findAllFiltered(String statut);
    List<Leave> findByEmployeeId(Long employeId);
    void delete(Long id);
    int countApprovedLeaveDaysThisYear(Long employeId, int annee);
    int countPendingRequests(Long employeId);
    int countAllPending();
    int countAllApproved();
    int countOnLeaveToday();
    int countPlannedThisMonth();
}
```

#### `domain/port/out/NotificationPort.java`

```java
package com.erp.erp.domain.port.out;
```

#### `domain/port/out/PayslipRepositoryPort.java`

```java
package com.erp.erp.domain.port.out;

import com.erp.erp.domain.model.Payslip;

import java.util.List;
import java.util.Optional;

public interface PayslipRepositoryPort {
    List<Payslip> findByEmployeeId(Long employeId);
    Optional<Payslip> findById(Long id);
}
```

#### `domain/port/out/PdfGeneratorPort.java`

```java
package com.erp.erp.domain.port.out;
```


### Domain Services

#### `domain/service/AbsenceService.java`

```java
package com.erp.erp.domain.service;

import com.erp.erp.domain.model.Absence;
import com.erp.erp.domain.port.in.absence.GetAbsenceUseCase;
import com.erp.erp.domain.port.out.AbsenceRepositoryPort;

import java.util.List;

public class AbsenceService implements GetAbsenceUseCase {

    private final AbsenceRepositoryPort absenceRepository;

    public AbsenceService(AbsenceRepositoryPort absenceRepository) {
        this.absenceRepository = absenceRepository;
    }

    public List<Absence> listEmployeeAbsences(Long employeId, int mois, int annee) {
        return absenceRepository.findByEmployeeIdAndMonth(employeId, mois, annee);
    }

    public int countAbsencesCurrentMonth(Long employeId, int mois, int annee) {
        return absenceRepository.countAbsencesCurrentMonth(employeId, mois, annee);
    }
}
```

#### `domain/service/DepartmentService.java`

```java
package com.erp.erp.domain.service;

import com.erp.erp.domain.model.Department;
import com.erp.erp.domain.port.in.department.CreateDepartmentUseCase;
import com.erp.erp.domain.port.in.department.GetDepartmentUseCase;
import com.erp.erp.domain.port.in.department.UpdateDepartmentUseCase;
import com.erp.erp.domain.port.out.DepartmentRepositoryPort;

import java.util.List;
import java.util.Optional;

public class DepartmentService implements GetDepartmentUseCase, CreateDepartmentUseCase, UpdateDepartmentUseCase {

    private final DepartmentRepositoryPort repository;

    public DepartmentService(DepartmentRepositoryPort repository) {
        this.repository = repository;
    }

    @Override
    public List<Department> listAll() {
        // Une seule requête SQL — plus de boucle N+1
        return repository.findAllWithStats();
    }

    @Override
    public Optional<Department> findById(Long id) {
        // Une seule requête SQL enrichie
        return repository.findByIdWithStats(id);
    }

    @Override
    public Department create(Department department) {
        Department saved = repository.save(department);
        return repository.findByIdWithStats(saved.getId()).orElse(saved);
    }

    @Override
    public Department update(Long id, String nom, String description, Long responsableId) {
        Department existing = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Département introuvable : " + id));
        existing.setNom(nom);
        existing.setDescription(description);
        existing.setResponsableId(responsableId);
        Department saved = repository.save(existing);
        return repository.findByIdWithStats(saved.getId()).orElse(saved);
    }

    @Override
    public void delete(Long id) {
        repository.deleteById(id);
    }
}
```

#### `domain/service/EmployeeService.java`

```java
package com.erp.erp.domain.service;

import com.erp.erp.application.command.CreateEmployeeCommand;
import com.erp.erp.application.mapper.EmployeeServiceMapper;
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

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public class EmployeeService implements CreateEmployeeUseCase, ListEmployeesUseCase {

    private final EmployeeRepositoryPort employeeRepositoryPort;
    private final EmployeeServiceMapper mapper;

    public EmployeeService(EmployeeRepositoryPort employeeRepositoryPort) {
        this.employeeRepositoryPort = employeeRepositoryPort;
        this.mapper = new EmployeeServiceMapper();
    }

    @Override
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

    private String generateMatricule() {
        return employeeRepositoryPort.generateNextMatricule(LocalDate.now().getYear());
    }
}
```

#### `domain/service/LeaveService.java`

```java
package com.erp.erp.domain.service;

import com.erp.erp.domain.model.Leave;
import com.erp.erp.domain.model.enums.LeaveStatus;
import com.erp.erp.domain.model.enums.LeaveType;
import com.erp.erp.domain.port.in.leave.ApproveLeaveUseCase;
import com.erp.erp.domain.port.in.leave.GetLeaveUseCase;
import com.erp.erp.domain.port.in.leave.RejectLeaveUseCase;
import com.erp.erp.domain.port.in.leave.RequestLeaveUseCase;
import com.erp.erp.domain.port.out.LeaveRepositoryPort;
import com.erp.erp.infrastructure.exception.exceptions.LeaveNotFoundException;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public class LeaveService implements RequestLeaveUseCase, GetLeaveUseCase, ApproveLeaveUseCase, RejectLeaveUseCase {

    private final LeaveRepositoryPort congeRepository;

    public LeaveService(LeaveRepositoryPort congeRepository) {
        this.congeRepository = congeRepository;
    }

    public Leave requestLeave(Long employeId, String type, LocalDate dateDebut, LocalDate dateFin, String motif) {
        if (dateFin.isBefore(dateDebut)) {
            throw new IllegalArgumentException("La date de fin doit être après la date de début");
        }

        int nombreJours = calculateBusinessDays(dateDebut, dateFin);
        if (nombreJours <= 0) {
            throw new IllegalArgumentException("La période sélectionnée ne contient aucun jour ouvrable");
        }

        Leave leave = new Leave();
        leave.setEmployeId(employeId);
        leave.setType(LeaveType.valueOf(type));
        leave.setDateDebut(dateDebut);
        leave.setDateFin(dateFin);
        leave.setNombreJours(nombreJours);
        leave.setStatut(LeaveStatus.EN_ATTENTE);
        leave.setMotif(motif);

        return congeRepository.save(leave);
    }

    public List<Leave> listAllLeaves() {
        return congeRepository.findAll();
    }

    public List<Leave> listAllLeavesFiltered(String statut) {
        return congeRepository.findAllFiltered(statut);
    }

    public List<Leave> listEmployeeLeaves(Long employeId) {
        return congeRepository.findByEmployeeId(employeId);
    }

    public void cancelLeave(Long congeId, Long employeId) {
        Leave leave = congeRepository.findById(congeId)
                .orElseThrow(() -> new LeaveNotFoundException(congeId));

        if (!leave.getEmployeId().equals(employeId)) {
            throw new IllegalArgumentException("Ce congé ne vous appartient pas");
        }

        if (leave.getStatut() != LeaveStatus.EN_ATTENTE) {
            throw new IllegalArgumentException("Seules les demandes en attente peuvent être annulées");
        }

        congeRepository.delete(congeId);
    }

    public Leave approveLeave(Long congeId, Long approbateurId) {
        Leave leave = congeRepository.findById(congeId)
                .orElseThrow(() -> new IllegalArgumentException("Congé introuvable"));

        if (leave.getStatut() != LeaveStatus.EN_ATTENTE) {
            throw new IllegalArgumentException("Ce congé n'est plus en attente");
        }

        leave.setStatut(LeaveStatus.APPROUVE);
        leave.setApprobateurId(approbateurId);
        return congeRepository.save(leave);
    }

    public Leave rejectLeave(Long congeId, Long approbateurId) {
        Leave leave = congeRepository.findById(congeId)
                .orElseThrow(() -> new IllegalArgumentException("Congé introuvable"));

        if (leave.getStatut() != LeaveStatus.EN_ATTENTE) {
            throw new IllegalArgumentException("Ce congé n'est plus en attente");
        }

        leave.setStatut(LeaveStatus.REJETE);
        leave.setApprobateurId(approbateurId);
        return congeRepository.save(leave);
    }

    public Optional<Leave> findById(Long id) {
        return congeRepository.findById(id);
    }

    public int countLeaveDaysTakenThisYear(Long employeId) {
        return congeRepository.countApprovedLeaveDaysThisYear(employeId, LocalDate.now().getYear());
    }

    public int countPendingRequests(Long employeId) {
        return congeRepository.countPendingRequests(employeId);
    }

    public int countAllPending() {
        return congeRepository.countAllPending();
    }

    public int countAllApproved() {
        return congeRepository.countAllApproved();
    }

    public int countOnLeaveToday() {
        return congeRepository.countOnLeaveToday();
    }

    public int countPlannedThisMonth() {
        return congeRepository.countPlannedThisMonth();
    }

    private int calculateBusinessDays(LocalDate debut, LocalDate fin) {
        int jours = 0;
        LocalDate date = debut;
        while (!date.isAfter(fin)) {
            DayOfWeek dow = date.getDayOfWeek();
            if (dow != DayOfWeek.SATURDAY && dow != DayOfWeek.SUNDAY) {
                jours++;
            }
            date = date.plusDays(1);
        }
        return jours;
    }
}
```

#### `domain/service/PayrollService.java`

```java
package com.erp.erp.domain.service;

import com.erp.erp.domain.model.Payslip;
import com.erp.erp.domain.port.out.PayslipRepositoryPort;

import java.util.List;
import java.util.Optional;

public class PayrollService {

    private final PayslipRepositoryPort payslipRepository;

    public PayrollService(PayslipRepositoryPort payslipRepository) {
        this.payslipRepository = payslipRepository;
    }

    public List<Payslip> listEmployeePayslips(Long employeId) {
        return payslipRepository.findByEmployeeId(employeId);
    }

    public Optional<Payslip> findById(Long id) {
        return payslipRepository.findById(id);
    }
}
```


### Domain Exceptions

#### `domain/exception/DomainException.java`

```java
package com.erp.erp.domain.exception;

public abstract class DomainException extends RuntimeException {
    protected DomainException(String message) {
        super(message);
    }

    protected DomainException(String message, Throwable cause) {
        super(message, cause);
    }
}
```

#### `domain/exception/LeaveNotFoundException.java`

```java
package com.erp.erp.domain.exception;

public class LeaveNotFoundException extends DomainException {
    public LeaveNotFoundException(Long id) {
        super("Congé introuvable avec l'identifiant : " + id);
    }
}
```


## 6. Application Layer


### Commands

#### `application/command/CreateEmployeeCommand.java`

```java
package com.erp.erp.application.command;

import java.math.BigDecimal;
import java.time.LocalDate;

public record CreateEmployeeCommand(
        String nom,
        String prenom,
        String email,
        String telephone,
        LocalDate dateNaissance,
        LocalDate dateEmbauche,
        String poste,
        Long departementId,
        String contractType,
        BigDecimal salaireBase,
        LocalDate dateFinContrat,
        String role
) {}
```

#### `application/command/RequestLeaveCommand.java`

```java
package com.erp.erp.application.command;

import java.time.LocalDate;

public record RequestLeaveCommand(
        String type,
        LocalDate dateDebut,
        LocalDate dateFin,
        String motif
) {}
```

### Results

#### `application/result/AbsenceResult.java`

```java
package com.erp.erp.application.result;

import java.time.LocalDate;

public record AbsenceResult(
        Long id,
        LocalDate date,
        String motif,
        boolean justifiee
) {}
```

#### `application/result/AdminLeaveResult.java`

```java
package com.erp.erp.application.result;

import java.time.LocalDate;

public record AdminLeaveResult(
        Long id,
        String type,
        LocalDate dateDebut,
        LocalDate dateFin,
        int nombreJours,
        String statut,
        String motif,
        Long employeId,
        String employeNom,
        String employePrenom,
        String employePoste
) {}
```

#### `application/result/EmployeeListResult.java`

```java
package com.erp.erp.application.result;

import java.math.BigDecimal;
import java.time.LocalDate;

public record EmployeeListResult(
        Long id,
        String matricule,
        String nom,
        String prenom,
        String email,
        String telephone,
        LocalDate dateNaissance,
        LocalDate dateEmbauche,
        String poste,
        String statut,
        Long departementId,
        String contractType,
        BigDecimal salaireBase
) {}
```

#### `application/result/EmployeeResult.java`

```java
package com.erp.erp.application.result;

import java.math.BigDecimal;
import java.time.LocalDate;

public record EmployeeResult(
        Long id,
        String matricule,
        String nom,
        String prenom,
        String email,
        String telephone,
        LocalDate dateNaissance,
        LocalDate dateEmbauche,
        String poste,
        String statut,
        Long departementId,
        String contractType,
        BigDecimal salaireBase
) {}
```

#### `application/result/LeaveResult.java`

```java
package com.erp.erp.application.result;

import java.time.LocalDate;

public record LeaveResult(
        Long id,
        String type,
        LocalDate dateDebut,
        LocalDate dateFin,
        int nombreJours,
        String statut,
        String motif,
        LocalDate dateDemande
) {}
```

#### `application/result/PayslipResult.java`

```java
package com.erp.erp.application.result;

import java.math.BigDecimal;

public record PayslipResult(
        Long id,
        int mois,
        int annee,
        BigDecimal salaireBase,
        BigDecimal deductionAbsences,
        BigDecimal primePresence,
        BigDecimal cotisationsTotal,
        BigDecimal salaireNet,
        String statut
) {}
```


### Application Mappers

#### `application/mapper/EmployeeServiceMapper.java`

```java
package com.erp.erp.application.mapper;

import com.erp.erp.application.result.EmployeeListResult;
import com.erp.erp.application.result.EmployeeResult;
import com.erp.erp.domain.model.Employee;
import com.erp.erp.domain.port.out.EmployeeRepositoryPort.ContractInfo;

import java.math.BigDecimal;

public class EmployeeServiceMapper {

    public EmployeeResult toResult(Employee employee, String contractType, BigDecimal salaireBase) {
        return new EmployeeResult(
                employee.getId(),
                employee.getMatricule(),
                employee.getNom(),
                employee.getPrenom(),
                employee.getEmail(),
                employee.getTelephone(),
                employee.getDateNaissance(),
                employee.getDateEmbauche(),
                employee.getPoste(),
                employee.getStatut().name(),
                employee.getDepartementId(),
                contractType,
                salaireBase);
    }

    public EmployeeListResult toListResult(Employee employee, ContractInfo contract) {
        return new EmployeeListResult(
                employee.getId(),
                employee.getMatricule(),
                employee.getNom(),
                employee.getPrenom(),
                employee.getEmail(),
                employee.getTelephone(),
                employee.getDateNaissance(),
                employee.getDateEmbauche(),
                employee.getPoste(),
                employee.getStatut() != null ? employee.getStatut().name() : null,
                employee.getDepartementId(),
                contract != null ? contract.type() : null,
                contract != null ? contract.salaireBase() : null);
    }
}
```

#### `application/mapper/LeaveServiceMapper.java`

```java
package com.erp.erp.application.mapper;

import com.erp.erp.application.result.AdminLeaveResult;
import com.erp.erp.domain.model.Employee;
import com.erp.erp.domain.model.Leave;

public class LeaveServiceMapper {

    public AdminLeaveResult toAdminResult(Leave leave, Employee employee) {
        return new AdminLeaveResult(
                leave.getId(),
                leave.getType().name(),
                leave.getDateDebut(),
                leave.getDateFin(),
                leave.getNombreJours(),
                leave.getStatut().name(),
                leave.getMotif(),
                leave.getEmployeId(),
                employee != null ? employee.getNom() : "Inconnu",
                employee != null ? employee.getPrenom() : "",
                employee != null ? employee.getPoste() : "");
    }
}
```


## 7. Adapter In Layer


### Controllers

#### `adapter/in/web/controller/AbsenceController.java`

```java
package com.erp.erp.adapter.in.web.controller;

import com.erp.erp.application.result.AbsenceResult;
import com.erp.erp.domain.model.Absence;
import com.erp.erp.domain.model.Employee;
import com.erp.erp.domain.port.in.absence.GetAbsenceUseCase;
import com.erp.erp.domain.port.out.EmployeeRepositoryPort;
import com.erp.erp.infrastructure.exception.exceptions.EmployeeNotFoundException;
import com.erp.erp.infrastructure.exception.exceptions.UnauthorizedException;
import com.erp.erp.infrastructure.security.JwtTokenProvider;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/${version.path}/absences")
public class AbsenceController {

    private final GetAbsenceUseCase getAbsenceUseCase;
    private final EmployeeRepositoryPort employeeRepositoryPort;
    private final JwtTokenProvider jwtTokenProvider;

    public AbsenceController(GetAbsenceUseCase getAbsenceUseCase,
            EmployeeRepositoryPort employeeRepositoryPort,
            JwtTokenProvider jwtTokenProvider) {
        this.getAbsenceUseCase = getAbsenceUseCase;
        this.employeeRepositoryPort = employeeRepositoryPort;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @GetMapping("/my-absences")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<AbsenceResult>> myAbsences(
            @RequestParam(required = false) Integer mois,
            @RequestParam(required = false) Integer annee) {
        Employee employee = getAuthenticatedEmployee();

        int m = mois != null ? mois : LocalDate.now().getMonthValue();
        int a = annee != null ? annee : LocalDate.now().getYear();

        List<AbsenceResult> results = getAbsenceUseCase.listEmployeeAbsences(employee.getId(), m, a)
                .stream().map(this::toResult).toList();
        return ResponseEntity.ok(results);
    }

    private Employee getAuthenticatedEmployee() {
        String email = jwtTokenProvider.getCurrentEmail()
                .orElseThrow(() -> new UnauthorizedException("Utilisateur non authentifié"));
        return employeeRepositoryPort.findByEmail(email)
                .orElseThrow(() -> new EmployeeNotFoundException("Profil employé introuvable"));
    }

    private AbsenceResult toResult(Absence a) {
        return new AbsenceResult(a.getId(), a.getDate(), a.getMotif(), a.isJustifiee());
    }
}
```

#### `adapter/in/web/controller/AuthController.java`

```java
package com.erp.erp.adapter.in.web.controller;

import com.erp.erp.adapter.in.web.dto.request.LoginRequest;
import com.erp.erp.adapter.in.web.dto.response.LoginResponse;
import com.erp.erp.adapter.in.web.dto.response.AuthUserResponse;
import com.erp.erp.infrastructure.security.JwtTokenProvider;
import com.erp.erp.infrastructure.security.JwtUtil;
import com.erp.erp.infrastructure.exception.exceptions.UnauthorizedException;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthController(AuthenticationManager authenticationManager, JwtUtil jwtUtil, JwtTokenProvider jwtTokenProvider) {
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );

        List<String> roles = auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .toList();

        String token = jwtUtil.generateToken(request.email(), roles);
        return ResponseEntity.ok(new LoginResponse(token));
    }

    @GetMapping("/me")
    public ResponseEntity<AuthUserResponse> me() {
        String email = jwtTokenProvider.getCurrentEmail()
                .orElseThrow(() -> new UnauthorizedException("Not authenticated"));

        List<String> roles = jwtTokenProvider.getCurrentRoles();

        // sub, username, email, roles
        return ResponseEntity.ok(new AuthUserResponse(email, email, email, roles));
    }
}
```

#### `adapter/in/web/controller/DepartmentController.java`

```java
package com.erp.erp.adapter.in.web.controller;

import com.erp.erp.adapter.in.web.dto.request.CreateDepartementRequest;
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
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<List<DepartmentResponse>> list() {
        List<Department> departements = getDepartmentUseCase.listAll();
        List<DepartmentResponse> response = departements.stream()
                .map(this::toResponse)
                .toList();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<DepartmentResponse> findById(@PathVariable Long id) {
        return getDepartmentUseCase.findById(id)
                .map(d -> ResponseEntity.ok(toResponse(d)))
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
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(saved));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<DepartmentResponse> update(@PathVariable Long id,
                                                       @RequestBody CreateDepartementRequest request) {
        Department updated = updateDepartmentUseCase.update(id, request.nom(), request.description(), request.responsableId());
        return ResponseEntity.ok(toResponse(updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('admin')")
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

}
```

#### `adapter/in/web/controller/EmployeeController.java`

```java
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
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/${version.path}/employees")
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
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> myProfile() {
        String email = jwtTokenProvider.getCurrentEmail()
                .orElseThrow(
                        () -> new UnauthorizedException("Utilisateur non authentifié (aucun subject dans le JWT)"));

        Employee employee = employeeRepositoryPort.findByEmail(email)
                .orElseThrow(() -> new EmployeeNotFoundException(
                        "Profil employé introuvable pour email=" + email));
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
            departmentService.findById(employee.getDepartementId())
                    .ifPresent(d -> result.put("departement", d.getNom()));
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
    @PreAuthorize("hasRole('admin')")
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
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<EmployeeResponse> create(@Valid @RequestBody CreateEmployeeRequest request) {
        CreateEmployeeCommand command = mapper.toCommand(request);
        EmployeeResult result = createEmployeeUseCase.create(command);
        EmployeeResponse response = mapper.toResponse(result);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<EmployeeResponse> getById(@PathVariable Long id) {
        Employee employee = employeeRepositoryPort.findById(id)
                .orElseThrow(() -> new EmployeeNotFoundException("Employ\u00e9 introuvable : id=" + id));
        EmployeeRepositoryPort.ContractInfo contract = employeeRepositoryPort.findContractByEmployeeId(id).orElse(null);
        EmployeeListResult result = new EmployeeListResult(
                employee.getId(), employee.getMatricule(),
                employee.getNom(), employee.getPrenom(), employee.getEmail(),
                employee.getTelephone(), employee.getDateNaissance(), employee.getDateEmbauche(),
                employee.getPoste(), employee.getStatut() != null ? employee.getStatut().name() : null,
                employee.getDepartementId(),
                contract != null ? contract.type() : null,
                contract != null ? contract.salaireBase() : null);
        return ResponseEntity.ok(mapper.toResponseFromList(result));
    }

    @GetMapping("/stats")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<Map<String, Object>> stats() {
        long total = listEmployeesUseCase.list("", null, "", 0, 1).totalElements();
        Map<ContractType, Long> distribution = employeeRepositoryPort.countByContractType();

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("totalEmployees", total);
        result.put("contractDistribution", distribution);
        return ResponseEntity.ok(result);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<EmployeeResponse> update(@PathVariable Long id,
            @Valid @RequestBody UpdateEmployeeRequest request) {
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
                saved.getId(), saved.getMatricule(),
                saved.getNom(), saved.getPrenom(), saved.getEmail(),
                saved.getTelephone(), saved.getDateNaissance(), saved.getDateEmbauche(),
                saved.getPoste(), saved.getStatut() != null ? saved.getStatut().name() : null,
                saved.getDepartementId(),
                contract != null ? contract.type() : null,
                contract != null ? contract.salaireBase() : null);
        return ResponseEntity.ok(mapper.toResponseFromList(result));
    }
}
```

#### `adapter/in/web/controller/LeaveController.java`

```java
package com.erp.erp.adapter.in.web.controller;

import com.erp.erp.application.result.AdminLeaveResult;
import com.erp.erp.application.result.LeaveResult;
import com.erp.erp.domain.model.Employee;
import com.erp.erp.domain.model.Leave;
import com.erp.erp.domain.port.in.leave.ApproveLeaveUseCase;
import com.erp.erp.domain.port.in.leave.GetLeaveUseCase;
import com.erp.erp.domain.port.in.leave.RejectLeaveUseCase;
import com.erp.erp.domain.port.in.leave.RequestLeaveUseCase;
import com.erp.erp.domain.port.out.EmployeeRepositoryPort;
import com.erp.erp.infrastructure.exception.exceptions.EmployeeNotFoundException;
import com.erp.erp.infrastructure.exception.exceptions.UnauthorizedException;
import com.erp.erp.infrastructure.security.JwtTokenProvider;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/${version.path}/leaves")
public class LeaveController {

    private final RequestLeaveUseCase requestLeaveUseCase;
    private final GetLeaveUseCase getLeaveUseCase;
    private final ApproveLeaveUseCase approveLeaveUseCase;
    private final RejectLeaveUseCase rejectLeaveUseCase;
    private final EmployeeRepositoryPort employeeRepositoryPort;
    private final JwtTokenProvider jwtTokenProvider;

    public LeaveController(RequestLeaveUseCase requestLeaveUseCase,
            GetLeaveUseCase getLeaveUseCase,
            ApproveLeaveUseCase approveLeaveUseCase,
            RejectLeaveUseCase rejectLeaveUseCase,
            EmployeeRepositoryPort employeeRepositoryPort,
            JwtTokenProvider jwtTokenProvider) {
        this.requestLeaveUseCase = requestLeaveUseCase;
        this.getLeaveUseCase = getLeaveUseCase;
        this.approveLeaveUseCase = approveLeaveUseCase;
        this.rejectLeaveUseCase = rejectLeaveUseCase;
        this.employeeRepositoryPort = employeeRepositoryPort;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @GetMapping("/my-leaves")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<LeaveResult>> myLeaves() {
        Employee employee = getAuthenticatedEmployee();
        List<LeaveResult> results = getLeaveUseCase.listEmployeeLeaves(employee.getId())
                .stream().map(this::toResult).toList();
        return ResponseEntity.ok(results);
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<LeaveResult> requestLeave(@RequestBody RequestLeaveRequest request) {
        Employee employee = getAuthenticatedEmployee();
        Leave leave = requestLeaveUseCase.requestLeave(
                employee.getId(),
                request.type(),
                request.dateDebut(),
                request.dateFin(),
                request.motif());
        return ResponseEntity.status(HttpStatus.CREATED).body(toResult(leave));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> cancelLeave(@PathVariable Long id) {
        Employee employee = getAuthenticatedEmployee();
        requestLeaveUseCase.cancelLeave(id, employee.getId());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/stats")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> leaveStats() {
        Employee employee = getAuthenticatedEmployee();
        int daysTaken = getLeaveUseCase.countLeaveDaysTakenThisYear(employee.getId());
        int pending = getLeaveUseCase.countPendingRequests(employee.getId());
        int balance = 30 - daysTaken;
        return ResponseEntity.ok(Map.of(
                "daysTaken", daysTaken,
                "pending", pending,
                "remainingBalance", Math.max(balance, 0)));
    }

    // ---- Routes admin ----

    @GetMapping
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<List<AdminLeaveResult>> allLeaves(
            @RequestParam(required = false) String statut,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long departementId,
            @RequestParam(required = false) String dateDebut,
            @RequestParam(required = false) String dateFin) {
        LocalDate debut = (dateDebut != null && !dateDebut.isBlank()) ? LocalDate.parse(dateDebut) : null;
        LocalDate fin = (dateFin != null && !dateFin.isBlank()) ? LocalDate.parse(dateFin) : null;
        return ResponseEntity.ok(getLeaveUseCase.searchLeaves(statut, search, departementId, debut, fin));
    }

    @GetMapping("/admin-stats")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<Map<String, Object>> adminStats() {
        return ResponseEntity.ok(Map.of(
                "pending", getLeaveUseCase.countAllPending(),
                "approved", getLeaveUseCase.countAllApproved(),
                "onLeaveToday", getLeaveUseCase.countOnLeaveToday(),
                "plannedThisMonth", getLeaveUseCase.countPlannedThisMonth()));
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<LeaveResult> approveLeave(@PathVariable Long id) {
        Long approbateurId = findAuthenticatedEmployeeId();
        Leave leave = approveLeaveUseCase.approveLeave(id, approbateurId);
        return ResponseEntity.ok(toResult(leave));
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<LeaveResult> rejectLeave(@PathVariable Long id) {
        Long approbateurId = findAuthenticatedEmployeeId();
        Leave leave = rejectLeaveUseCase.rejectLeave(id, approbateurId);
        return ResponseEntity.ok(toResult(leave));
    }

    // ---- Helpers privés ----

    private Employee getAuthenticatedEmployee() {
        String email = jwtTokenProvider.getCurrentEmail()
                .orElseThrow(() -> new UnauthorizedException("Utilisateur non authentifié"));
        return employeeRepositoryPort.findByEmail(email)
                .orElseThrow(() -> new EmployeeNotFoundException("Profil employé introuvable"));
    }

    private Long findAuthenticatedEmployeeId() {
        String email = jwtTokenProvider.getCurrentEmail().orElse(null);
        if (email == null)
            return null;
        return employeeRepositoryPort.findByEmail(email)
                .map(Employee::getId)
                .orElse(null);
    }

    private LeaveResult toResult(Leave c) {
        return new LeaveResult(
                c.getId(), c.getType().name(), c.getDateDebut(), c.getDateFin(),
                c.getNombreJours(), c.getStatut().name(), c.getMotif(),
                c.getCreatedAt() != null ? c.getCreatedAt().toLocalDate() : null);
    }

    public record RequestLeaveRequest(String type, LocalDate dateDebut, LocalDate dateFin, String motif) {
    }
}
```

#### `adapter/in/web/controller/PayrollController.java`

```java
package com.erp.erp.adapter.in.web.controller;

import com.erp.erp.application.result.PayslipResult;
import com.erp.erp.domain.model.Employee;
import com.erp.erp.domain.model.Payslip;
import com.erp.erp.domain.port.out.EmployeeRepositoryPort;
import com.erp.erp.domain.service.PayrollService;
import com.erp.erp.infrastructure.security.JwtTokenProvider;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/${version.path}/payroll")
public class PayrollController {

        private final PayrollService payrollService;
        private final EmployeeRepositoryPort employeeRepositoryPort;
        private final JwtTokenProvider jwtTokenProvider;

        public PayrollController(PayrollService payrollService,
                        EmployeeRepositoryPort employeeRepositoryPort,
                        JwtTokenProvider jwtTokenProvider) {
                this.payrollService = payrollService;
                this.employeeRepositoryPort = employeeRepositoryPort;
                this.jwtTokenProvider = jwtTokenProvider;
        }

        @GetMapping("/my-payslips")
        @PreAuthorize("isAuthenticated()")
        public ResponseEntity<List<PayslipResult>> myPayslips() {
                Employee employee = getAuthenticatedEmployee();
                List<PayslipResult> results = payrollService.listEmployeePayslips(employee.getId())
                                .stream().map(this::toResult).toList();
                return ResponseEntity.ok(results);
        }

        @GetMapping("/{id}/pdf")
        @PreAuthorize("isAuthenticated()")
        public ResponseEntity<byte[]> downloadPdf(@PathVariable Long id) {
                Employee employee = getAuthenticatedEmployee();
                Payslip fiche = payrollService.findById(id)
                                .orElseThrow(() -> new IllegalArgumentException("Fiche de paie introuvable"));

                if (!fiche.getEmployeId().equals(employee.getId())) {
                        throw new IllegalArgumentException("Cette fiche de paie ne vous appartient pas");
                }

                String content = String.format(
                                "FICHE DE PAIE - %02d/%d\nSalaire Base: %s\nSalaire Net: %s\nStatut: %s",
                                fiche.getMois(), fiche.getAnnee(), fiche.getSalaireBase(), fiche.getSalaireNet(),
                                fiche.getStatut());

                return ResponseEntity.ok()
                                .header("Content-Type", "application/pdf")
                                .header("Content-Disposition",
                                                "attachment; filename=fiche_" + fiche.getMois() + "_" + fiche.getAnnee()
                                                                + ".pdf")
                                .body(content.getBytes());
        }

        private Employee getAuthenticatedEmployee() {
                String email = jwtTokenProvider.getCurrentEmail()
                                .orElseThrow(() -> new IllegalArgumentException("Utilisateur non authentifié"));
                return employeeRepositoryPort.findByEmail(email)
                                .orElseThrow(() -> new IllegalArgumentException("Profil employé introuvable"));
        }

        private PayslipResult toResult(Payslip f) {
                return new PayslipResult(
                                f.getId(), f.getMois(), f.getAnnee(), f.getSalaireBase(),
                                f.getDeductionAbsences(), f.getPrimePresence(),
                                f.getCotisationsTotal(), f.getSalaireNet(),
                                f.getStatut().name());
        }
}
```


### Request DTOs

#### `adapter/in/web/dto/request/CalculatePayrollRequest.java`

```java
package com.erp.erp.adapter.in.web.dto.request;
```

#### `adapter/in/web/dto/request/CreateDepartementRequest.java`

```java
package com.erp.erp.adapter.in.web.dto.request;

public record CreateDepartementRequest(
        String nom,
        String description,
        Long responsableId
) {}
```

#### `adapter/in/web/dto/request/CreateEmployeeRequest.java`

```java
package com.erp.erp.adapter.in.web.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.time.LocalDate;

public record CreateEmployeeRequest(
        @NotBlank
        String nom,

        @NotBlank
        String prenom,

        @NotBlank
        @Email
        String email,
        String telephone,
        LocalDate dateNaissance,

        @NotNull
        LocalDate dateEmbauche,

        @NotBlank
        String poste,

        @NotNull
        Long departementId,

        @NotBlank
        String contractType,

        @NotNull @Positive
        BigDecimal salaireBase,

        LocalDate dateFinContrat,

        @NotBlank
        String role
) {

}
```

#### `adapter/in/web/dto/request/LoginRequest.java`

```java
package com.erp.erp.adapter.in.web.dto.request;

public record LoginRequest(
        String email,
        String password
) {}
```

#### `adapter/in/web/dto/request/RegisterAbsenceRequest.java`

```java
package com.erp.erp.adapter.in.web.dto.request;
```

#### `adapter/in/web/dto/request/RequestLeaveRequest.java`

```java
package com.erp.erp.adapter.in.web.dto.request;
```

#### `adapter/in/web/dto/request/UpdateEmployeeRequest.java`

```java
package com.erp.erp.adapter.in.web.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;

public record UpdateEmployeeRequest(
        @NotBlank String nom,
        @NotBlank String prenom,
        String telephone,
        LocalDate dateNaissance,
        @NotNull LocalDate dateEmbauche,
        @NotBlank String poste,
        String statut,
        Long departementId,
        String contractType,
        @Positive BigDecimal salaireBase,
        LocalDate dateFinContrat
) {}
```


### Response DTOs

#### `adapter/in/web/dto/response/AuthUserResponse.java`

```java
package com.erp.erp.adapter.in.web.dto.response;

import java.util.List;

public record AuthUserResponse(
        String sub,
        String username,
        String email,
        List<String> roles
) {}
```

#### `adapter/in/web/dto/response/DepartmentResponse.java`

```java
package com.erp.erp.adapter.in.web.dto.response;

public record DepartmentResponse(
        Long id,
        String nom,
        String description,
        Long responsableId,
        String responsableNom,
        long nombreEmployes
) {}
```

#### `adapter/in/web/dto/response/EmployeeResponse.java`

```java
package com.erp.erp.adapter.in.web.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;

public record EmployeeResponse(
        Long id,
        String matricule,
        String nom,
        String prenom,
        String email,
        String telephone,
        LocalDate dateNaissance,
        LocalDate dateEmbauche,
        String poste,
        String statut,
        Long departementId,
        String contractType,
        BigDecimal salaireBase
) {}
```

#### `adapter/in/web/dto/response/LoginResponse.java`

```java
package com.erp.erp.adapter.in.web.dto.response;

public record LoginResponse(
        String token
) {}
```

#### `adapter/in/web/dto/response/PagedEmployeeResponse.java`

```java
package com.erp.erp.adapter.in.web.dto.response;

import java.util.List;

public record PagedEmployeeResponse(
        List<EmployeeResponse> content,
        long totalElements,
        int totalPages,
        int number,
        int size
) {}
```

### Web Mappers

#### `adapter/in/web/mapper/EmployeeWebMapper.java`

```java
package com.erp.erp.adapter.in.web.mapper;

import com.erp.erp.adapter.in.web.dto.request.CreateEmployeeRequest;
import com.erp.erp.adapter.in.web.dto.response.EmployeeResponse;
import com.erp.erp.adapter.in.web.dto.response.PagedEmployeeResponse;
import com.erp.erp.application.command.CreateEmployeeCommand;
import com.erp.erp.application.result.EmployeeListResult;
import com.erp.erp.application.result.EmployeeResult;
import com.erp.erp.domain.model.PageResult;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface EmployeeWebMapper {
    CreateEmployeeCommand toCommand(CreateEmployeeRequest request);
    EmployeeResponse toResponse(EmployeeResult result);
    EmployeeResponse toResponseFromList(EmployeeListResult result);

    default PagedEmployeeResponse toPagedResponse(PageResult<EmployeeListResult> page) {
        List<EmployeeResponse> content = page.content().stream()
                .map(this::toResponseFromList)
                .toList();
        return new PagedEmployeeResponse(content, page.totalElements(), page.totalPages(), page.number(), page.size());
    }
}
```

### Exception Handler

#### `adapter/in/web/exception/GlobalExceptionHandler.java`

```java
package com.erp.erp.adapter.in.web.exception;

import com.erp.erp.infrastructure.exception.exceptions.EmployeeNotFoundException;
import com.erp.erp.infrastructure.exception.exceptions.LeaveConflictException;
import com.erp.erp.infrastructure.exception.exceptions.LeaveNotFoundException;
import com.erp.erp.infrastructure.exception.exceptions.UnauthorizedException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(EmployeeNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleEmployeeNotFound(EmployeeNotFoundException ex) {
        log.warn("Employee not found: {}", ex.getMessage());
        return buildResponse(HttpStatus.NOT_FOUND, ex.getMessage());
    }

    @ExceptionHandler(LeaveNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleLeaveNotFound(LeaveNotFoundException ex) {
        log.warn("Leave not found: {}", ex.getMessage());
        return buildResponse(HttpStatus.NOT_FOUND, ex.getMessage());
    }

    @ExceptionHandler(LeaveConflictException.class)
    public ResponseEntity<Map<String, Object>> handleLeaveConflict(LeaveConflictException ex) {
        log.warn("Leave conflict: {}", ex.getMessage());
        return buildResponse(HttpStatus.CONFLICT, ex.getMessage());
    }

    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<Map<String, Object>> handleUnauthorized(UnauthorizedException ex) {
        log.warn("Non authentifié: {}", ex.getMessage());
        return buildResponse(HttpStatus.UNAUTHORIZED, ex.getMessage());
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgument(IllegalArgumentException ex) {
        log.warn("Requête invalide: {}", ex.getMessage());
        return buildResponse(HttpStatus.BAD_REQUEST, ex.getMessage());
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, Object>> handleAccessDenied(AccessDeniedException ex) {
        log.warn("Accès refusé: {}", ex.getMessage());
        return buildResponse(HttpStatus.FORBIDDEN, "Accès refusé");
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .map(e -> e.getField() + ": " + e.getDefaultMessage())
                .reduce((a, b) -> a + "; " + b)
                .orElse("Erreur de validation");
        log.warn("Validation échouée: {}", message);
        return buildResponse(HttpStatus.BAD_REQUEST, message);
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<Map<String, Object>> handleAuthentication(AuthenticationException ex) {
        log.warn("Échec d'authentification: {}", ex.getMessage());
        return buildResponse(HttpStatus.UNAUTHORIZED, "Email ou mot de passe incorrect");
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGeneral(Exception ex) {
        log.error("Erreur interne du serveur", ex);
        return buildResponse(HttpStatus.INTERNAL_SERVER_ERROR, "Erreur interne du serveur: " + ex.getMessage());
    }

    private ResponseEntity<Map<String, Object>> buildResponse(HttpStatus status, String message) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now().toString());
        body.put("status", status.value());
        body.put("error", status.getReasonPhrase());
        body.put("message", message);
        return ResponseEntity.status(status).body(body);
    }
}
```


## 8. Adapter Out Layer


### JPA Entities

#### `adapter/out/persistence/entity/AbsenceJpaEntity.java`

```java
package com.erp.erp.adapter.out.persistence.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "absence")
public class AbsenceJpaEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "employe_id", nullable = false)
    private Long employeId;

    @Column(name = "\"DATE\"", nullable = false)
    private LocalDate date;

    @Column(columnDefinition = "TEXT")
    private String motif;

    @Column(nullable = false, columnDefinition = "boolean default false")
    private boolean justifiee;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
}
```

#### `adapter/out/persistence/entity/ContractJpaEntity.java`

```java
package com.erp.erp.adapter.out.persistence.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "contract")
public class ContractJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "employe_id", nullable = false, unique = true)
    private Long employeId;

    @Column(nullable = false, length = 20)
    private String type;

    @Column(name = "date_debut", nullable = false)
    private LocalDate dateDebut;

    @Column(name = "date_fin")
    private LocalDate dateFin;

    @Column(name = "salaire_base", nullable = false, precision = 12, scale = 2)
    private BigDecimal salaireBase;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
}
```

#### `adapter/out/persistence/entity/DepartmentJpaEntity.java`

```java
package com.erp.erp.adapter.out.persistence.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "department")
public class DepartmentJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String nom;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "responsable_id")
    private Long responsableId;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
```

#### `adapter/out/persistence/entity/EmployeeJpaEntity.java`

```java
package com.erp.erp.adapter.out.persistence.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "Employee")
public class EmployeeJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 20)
    private String matricule;

    @Column(nullable = false, length = 100)
    private String nom;

    @Column(nullable = false, length = 100)
    private String prenom;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Column(length = 20)
    private String telephone;

    @Column(name = "date_naissance")
    private LocalDate dateNaissance;

    @Column(name = "date_embauche", nullable = false)
    private LocalDate dateEmbauche;

    @Column(nullable = false, length = 100)
    private String poste;

    @Column(nullable = false, length = 20)
    private String statut;

    @Column(name = "departement_id")
    private Long departementId;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
```

#### `adapter/out/persistence/entity/LeaveJpaEntity.java`

```java
package com.erp.erp.adapter.out.persistence.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "Leave")
public class LeaveJpaEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "employe_id", nullable = false)
    private Long employeId;

    @Column(name = "approbateur_id")
    private Long approbateurId;

    @Column(nullable = false, length = 20)
    private String type;

    @Column(name = "date_debut", nullable = false)
    private LocalDate dateDebut;

    @Column(name = "date_fin", nullable = false)
    private LocalDate dateFin;

    @Column(name = "nombre_jours", nullable = false)
    private int nombreJours;

    @Column(nullable = false, length = 20)
    private String statut;

    @Column(columnDefinition = "TEXT")
    private String motif;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
}
```

#### `adapter/out/persistence/entity/PayslipJpaEntity.java`

```java
package com.erp.erp.adapter.out.persistence.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "fiche_de_paie")
public class PayslipJpaEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "employe_id", nullable = false)
    private Long employeId;

    @Column(nullable = false)
    private int mois;

    @Column(nullable = false)
    private int annee;

    @Column(name = "salaire_base", nullable = false, precision = 12, scale = 2)
    private BigDecimal salaireBase;

    @Column(name = "total_absences")
    private int totalAbsences;

    @Column(name = "deduction_absences", precision = 12, scale = 2)
    private BigDecimal deductionAbsences;

    @Column(name = "prime_presence", precision = 12, scale = 2)
    private BigDecimal primePresence;

    @Column(name = "cotisations_total", precision = 12, scale = 2)
    private BigDecimal cotisationsTotal;

    @Column(name = "salaire_net", nullable = false, precision = 12, scale = 2)
    private BigDecimal salaireNet;

    @Column(nullable = false, length = 20)
    private String statut;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
}
```


### JPA Repositories

#### `adapter/out/persistence/repository/AbsenceJpaRepository.java`

```java
package com.erp.erp.adapter.out.persistence.repository;

import com.erp.erp.adapter.out.persistence.entity.AbsenceJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AbsenceJpaRepository extends JpaRepository<AbsenceJpaEntity, Long> {
    @Query("SELECT a FROM AbsenceJpaEntity a " +
           "WHERE a.employeId = :employeId " +
           "AND EXTRACT(MONTH FROM a.date) = :mois " +
           "AND EXTRACT(YEAR FROM a.date) = :annee " +
           "ORDER BY a.date DESC")
    List<AbsenceJpaEntity> findByEmployeIdAndMois(
            @Param("employeId") Long employeId,
            @Param("mois") int mois,
            @Param("annee") int annee);

    @Query("SELECT COUNT(a) FROM AbsenceJpaEntity a " +
           "WHERE a.employeId = :employeId " +
           "AND EXTRACT(MONTH FROM a.date) = :mois " +
           "AND EXTRACT(YEAR FROM a.date) = :annee")
    int countAbsences(@Param("employeId") Long employeId,
                        @Param("mois") int mois,
                        @Param("annee") int annee);
}
```

#### `adapter/out/persistence/repository/ContractJpaRepository.java`

```java
package com.erp.erp.adapter.out.persistence.repository;

import com.erp.erp.adapter.out.persistence.entity.ContractJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ContractJpaRepository extends JpaRepository<ContractJpaEntity, Long> {
    List<ContractJpaEntity> findByEmployeIdIn(List<Long> employeIds);

    @Query("SELECT c.type, COUNT(c) FROM ContractJpaEntity c GROUP BY c.type")
    List<Object[]> countByContractType();
}
```

#### `adapter/out/persistence/repository/DepartmentJpaRepository.java`

```java
package com.erp.erp.adapter.out.persistence.repository;

import com.erp.erp.adapter.out.persistence.entity.DepartmentJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DepartmentJpaRepository extends JpaRepository<DepartmentJpaEntity, Long> {

    /**
     * Requête unifiée : retourne [DepartmentJpaEntity, nombreEmployes (Long), responsableNom (String)]
     * en une seule jointure — élimine le N+1.
     */
    @Query("SELECT d, COUNT(e.id), " +
           "CASE WHEN mgr.id IS NOT NULL THEN CONCAT(mgr.prenom, ' ', mgr.nom) ELSE NULL END " +
           "FROM DepartmentJpaEntity d " +
           "LEFT JOIN EmployeeJpaEntity e ON e.departementId = d.id " +
           "LEFT JOIN EmployeeJpaEntity mgr ON mgr.id = d.responsableId " +
           "GROUP BY d.id, d.nom, d.description, d.responsableId, d.createdAt, d.updatedAt, mgr.id, mgr.prenom, mgr.nom " +
           "ORDER BY d.nom")
    List<Object[]> findAllWithStats();

    @Query("SELECT d, COUNT(e.id), " +
           "CASE WHEN mgr.id IS NOT NULL THEN CONCAT(mgr.prenom, ' ', mgr.nom) ELSE NULL END " +
           "FROM DepartmentJpaEntity d " +
           "LEFT JOIN EmployeeJpaEntity e ON e.departementId = d.id " +
           "LEFT JOIN EmployeeJpaEntity mgr ON mgr.id = d.responsableId " +
           "WHERE d.id = :id " +
           "GROUP BY d.id, d.nom, d.description, d.responsableId, d.createdAt, d.updatedAt, mgr.id, mgr.prenom, mgr.nom")
    List<Object[]> findByIdWithStats(@Param("id") Long id);
}
```

#### `adapter/out/persistence/repository/EmployeeJpaRepository.java`

```java
package com.erp.erp.adapter.out.persistence.repository;

import com.erp.erp.adapter.out.persistence.entity.EmployeeJpaEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeJpaRepository extends JpaRepository<EmployeeJpaEntity, Long> {
       boolean existsByEmail(String email);

       Optional<EmployeeJpaEntity> findByEmail(String email);

       @Query("SELECT e FROM EmployeeJpaEntity e WHERE " +
                      "(:search IS NULL OR :search = '' OR " +
                      "LOWER(e.nom) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
                      "LOWER(e.prenom) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
                      "LOWER(e.email) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
                      "LOWER(e.matricule) LIKE LOWER(CONCAT('%', :search, '%'))) " +
                      "AND (:departementId IS NULL OR e.departementId = :departementId) " +
                      "AND (:statut IS NULL OR :statut = '' OR e.statut = :statut)")
       Page<EmployeeJpaEntity> search(
                      @Param("search") String search,
                      @Param("departementId") Long departementId,
                      @Param("statut") String statut,
                      Pageable pageable);

       @Query("SELECT e.matricule FROM EmployeeJpaEntity e " +
                      "WHERE e.matricule LIKE CONCAT(:prefix, '%') " +
                      "ORDER BY e.matricule DESC")
       List<String> findLastMatriculeByPrefix(@Param("prefix") String prefix, Pageable pageable);
}
```

#### `adapter/out/persistence/repository/LeaveJpaRepository.java`

```java
package com.erp.erp.adapter.out.persistence.repository;

import com.erp.erp.adapter.out.persistence.entity.LeaveJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface LeaveJpaRepository extends JpaRepository<LeaveJpaEntity, Long> {
    List<LeaveJpaEntity> findByEmployeIdOrderByCreatedAtDesc(Long employeId);
    List<LeaveJpaEntity> findAllByOrderByCreatedAtDesc();

    @Query("SELECT c FROM LeaveJpaEntity c WHERE (:statut IS NULL OR c.statut = :statut) ORDER BY c.createdAt DESC")
    List<LeaveJpaEntity> findFiltered(@Param("statut") String statut);

    @Query("SELECT COALESCE(SUM(c.nombreJours), 0) FROM LeaveJpaEntity c " +
           "WHERE c.employeId = :employeId AND c.statut = 'APPROUVE' " +
           "AND EXTRACT(YEAR FROM c.dateDebut) = :annee")
    int countApprovedDays(@Param("employeId") Long employeId, @Param("annee") int annee);

    @Query("SELECT COUNT(c) FROM LeaveJpaEntity c " +
           "WHERE c.employeId = :employeId AND c.statut = 'EN_ATTENTE'")
    int countPending(@Param("employeId") Long employeId);

    @Query("SELECT COUNT(c) FROM LeaveJpaEntity c WHERE c.statut = 'EN_ATTENTE'")
    int countAllPending();

    @Query("SELECT COUNT(c) FROM LeaveJpaEntity c WHERE c.statut = 'APPROUVE'")
    int countAllApproved();

    @Query("SELECT COUNT(c) FROM LeaveJpaEntity c " +
           "WHERE c.statut = 'APPROUVE' AND c.dateDebut <= :today AND c.dateFin >= :today")
    int countOnLeaveToday(@Param("today") LocalDate today);

    @Query("SELECT COUNT(c) FROM LeaveJpaEntity c " +
           "WHERE c.statut IN ('EN_ATTENTE', 'APPROUVE') " +
           "AND EXTRACT(YEAR FROM c.dateDebut) = :year AND EXTRACT(MONTH FROM c.dateDebut) = :month")
    int countPlannedThisMonth(@Param("year") int year, @Param("month") int month);
}
```

#### `adapter/out/persistence/repository/PayslipJpaRepository.java`

```java
package com.erp.erp.adapter.out.persistence.repository;

import com.erp.erp.adapter.out.persistence.entity.PayslipJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PayslipJpaRepository extends JpaRepository<PayslipJpaEntity, Long> {
    List<PayslipJpaEntity> findByEmployeIdOrderByAnneeDescMoisDesc(Long employeId);
}
```

#### `adapter/out/persistence/repository/RoleRepository.java`

```java
package com.erp.erp.adapter.out.persistence.repository;

import com.erp.erp.domain.model.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByName(String name);
}
```

#### `adapter/out/persistence/repository/UserRepository.java`

```java
package com.erp.erp.adapter.out.persistence.repository;

import com.erp.erp.domain.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
}
```


### JPA Mappers

#### `adapter/out/persistence/mapper/EmployeeJpaMapper.java`

```java
package com.erp.erp.adapter.out.persistence.mapper;

import com.erp.erp.adapter.out.persistence.entity.EmployeeJpaEntity;
import com.erp.erp.domain.model.Employee;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface EmployeeJpaMapper {

    @Mapping(target = "statut", expression = "java(entity.getStatut() != null ? com.erp.erp.domain.model.enums.EmployeeStatus.valueOf(entity.getStatut()) : null)")
    Employee toDomain(EmployeeJpaEntity entity);

    @Mapping(target = "statut", expression = "java(employee.getStatut() != null ? employee.getStatut().name() : null)")
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    EmployeeJpaEntity toEntity(Employee employee);
}
```

### Persistence Adapters

#### `adapter/out/persistence/adapter/AbsencePersistenceAdapter.java`

```java
package com.erp.erp.adapter.out.persistence.adapter;

import com.erp.erp.adapter.out.persistence.entity.AbsenceJpaEntity;
import com.erp.erp.adapter.out.persistence.repository.AbsenceJpaRepository;
import com.erp.erp.domain.model.Absence;
import com.erp.erp.domain.port.out.AbsenceRepositoryPort;
import org.springframework.stereotype.Component;
import java.util.List;

@Component
public class AbsencePersistenceAdapter implements AbsenceRepositoryPort {
    private final AbsenceJpaRepository repository;
    public AbsencePersistenceAdapter(AbsenceJpaRepository repository) {
        this.repository = repository;
    }

    @Override
    public List<Absence> findByEmployeeIdAndMonth(Long employeId, int mois, int annee) {
        return repository.findByEmployeIdAndMois(employeId, mois, annee)
                .stream().map(this::toDomain).toList();
    }

    @Override
    public int countAbsencesCurrentMonth(Long employeId, int mois, int annee) {
        return repository.countAbsences(employeId, mois, annee);
    }

    private Absence toDomain(AbsenceJpaEntity e) {
        Absence a = new Absence();
        a.setId(e.getId());
        a.setEmployeId(e.getEmployeId());
        a.setDate(e.getDate());
        a.setMotif(e.getMotif());
        a.setJustifiee(e.isJustifiee());
        return a;
    }
}
```

#### `adapter/out/persistence/adapter/DepartmentPersistenceAdapter.java`

```java
package com.erp.erp.adapter.out.persistence.adapter;

import com.erp.erp.adapter.out.persistence.entity.DepartmentJpaEntity;
import com.erp.erp.adapter.out.persistence.repository.DepartmentJpaRepository;
import com.erp.erp.domain.model.Department;
import com.erp.erp.domain.port.out.DepartmentRepositoryPort;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
public class DepartmentPersistenceAdapter implements DepartmentRepositoryPort {

    private final DepartmentJpaRepository jpaRepository;

    public DepartmentPersistenceAdapter(DepartmentJpaRepository jpaRepository) {
        this.jpaRepository = jpaRepository;
    }

    @Override
    public List<Department> findAll() {
        return jpaRepository.findAll().stream().map(this::toDomain).toList();
    }

    @Override
    public Optional<Department> findById(Long id) {
        return jpaRepository.findById(id).map(this::toDomain);
    }

    @Override
    public Department save(Department department) {
        DepartmentJpaEntity entity = toEntity(department);
        DepartmentJpaEntity saved = jpaRepository.save(entity);
        return toDomain(saved);
    }

    @Override
    public void deleteById(Long id) {
        jpaRepository.deleteById(id);
    }

    @Override
    public List<Department> findAllWithStats() {
        return jpaRepository.findAllWithStats().stream()
                .map(this::rowToDomain)
                .toList();
    }

    @Override
    public Optional<Department> findByIdWithStats(Long id) {
        return jpaRepository.findByIdWithStats(id).stream()
                .map(this::rowToDomain)
                .findFirst();
    }

    // ---- Mappers ----

    private Department rowToDomain(Object[] row) {
        DepartmentJpaEntity entity = (DepartmentJpaEntity) row[0];
        long nombreEmployes = ((Number) row[1]).longValue();
        String responsableNom = (String) row[2];
        Department d = toDomain(entity);
        d.setNombreEmployes(nombreEmployes);
        d.setResponsableNom(responsableNom);
        return d;
    }

    private Department toDomain(DepartmentJpaEntity entity) {
        Department d = new Department();
        d.setId(entity.getId());
        d.setNom(entity.getNom());
        d.setDescription(entity.getDescription());
        d.setResponsableId(entity.getResponsableId());
        d.setCreatedAt(entity.getCreatedAt());
        d.setUpdatedAt(entity.getUpdatedAt());
        return d;
    }

    private DepartmentJpaEntity toEntity(Department domain) {
        DepartmentJpaEntity entity = new DepartmentJpaEntity();
        entity.setId(domain.getId());
        entity.setNom(domain.getNom());
        entity.setDescription(domain.getDescription());
        entity.setResponsableId(domain.getResponsableId());
        return entity;
    }
}
```

#### `adapter/out/persistence/adapter/EmployeePersistenceAdapter.java`

```java
package com.erp.erp.adapter.out.persistence.adapter;

import com.erp.erp.adapter.out.persistence.entity.ContractJpaEntity;
import com.erp.erp.adapter.out.persistence.entity.EmployeeJpaEntity;
import com.erp.erp.adapter.out.persistence.mapper.EmployeeJpaMapper;
import com.erp.erp.adapter.out.persistence.repository.ContractJpaRepository;
import com.erp.erp.adapter.out.persistence.repository.EmployeeJpaRepository;
import com.erp.erp.domain.model.Employee;
import com.erp.erp.domain.model.PageResult;
import com.erp.erp.domain.model.enums.ContractType;
import com.erp.erp.domain.port.out.EmployeeRepositoryPort;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Component;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
public class EmployeePersistenceAdapter implements EmployeeRepositoryPort {

    private final EmployeeJpaRepository employeJpaRepository;
    private final ContractJpaRepository contratJpaRepository;
    private final EmployeeJpaMapper mapper;

    public EmployeePersistenceAdapter(EmployeeJpaRepository employeJpaRepository,
            ContractJpaRepository contratJpaRepository,
            EmployeeJpaMapper mapper) {
        this.employeJpaRepository = employeJpaRepository;
        this.contratJpaRepository = contratJpaRepository;
        this.mapper = mapper;
    }

    @Override
    public Employee save(Employee employee) {
        EmployeeJpaEntity entity = mapper.toEntity(employee);
        EmployeeJpaEntity saved = employeJpaRepository.save(entity);
        return mapper.toDomain(saved);
    }

    @Override
    public void saveContract(Long employeId, ContractType type, BigDecimal salaireBase,
            LocalDate dateDebut, LocalDate dateFin) {
        ContractJpaEntity contract = new ContractJpaEntity();
        contract.setEmployeId(employeId);
        contract.setType(type.name());
        contract.setSalaireBase(salaireBase);
        contract.setDateDebut(dateDebut);
        contract.setDateFin(dateFin);
        contratJpaRepository.save(contract);
    }

    @Override
    public void updateContract(Long employeId, ContractType type, BigDecimal salaireBase, LocalDate dateFin) {
        contratJpaRepository.findByEmployeIdIn(List.of(employeId))
                .stream().findFirst().ifPresent(c -> {
                    c.setType(type.name());
                    c.setSalaireBase(salaireBase);
                    c.setDateFin(dateFin);
                    c.setUpdatedAt(LocalDateTime.now());
                    contratJpaRepository.save(c);
                });
    }

    @Override
    public boolean existsByEmail(String email) {
        return employeJpaRepository.existsByEmail(email);
    }

    @Override
    public String generateNextMatricule(int year) {
        String prefix = String.format("EMP-%d-", year);
        List<String> results = employeJpaRepository.findLastMatriculeByPrefix(
                prefix, PageRequest.of(0, 1));
        if (results.isEmpty()) {
            return prefix + "0001";
        }
        String last = results.get(0);
        String[] parts = last.split("-");
        int next = Integer.parseInt(parts[parts.length - 1]) + 1;
        return String.format("%s%04d", prefix, next);
    }

    @Override
    public Map<ContractType, Long> countByContractType() {
        List<Object[]> rows = contratJpaRepository.countByContractType();
        Map<ContractType, Long> result = new java.util.EnumMap<>(ContractType.class);
        for (Object[] row : rows) {
            ContractType type = ContractType.valueOf((String) row[0]);
            Long count = (Long) row[1];
            result.put(type, count);
        }
        return result;
    }

    @Override
    public PageResult<Employee> searchEmployees(String search, Long departementId, String statut, int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<EmployeeJpaEntity> jpaPage = employeJpaRepository.search(search, departementId, statut, pageRequest);

        List<Employee> employes = jpaPage.getContent().stream()
                .map(mapper::toDomain)
                .toList();

        return new PageResult<>(employes, jpaPage.getTotalElements(), jpaPage.getTotalPages(), jpaPage.getNumber(),
                jpaPage.getSize());
    }

    @Override
    public Map<Long, ContractInfo> findContractsForEmployees(List<Long> employeIds) {
        if (employeIds.isEmpty())
            return Map.of();

        List<ContractJpaEntity> contrats = contratJpaRepository.findByEmployeIdIn(employeIds);
        return contrats.stream()
                .collect(Collectors.toMap(
                        ContractJpaEntity::getEmployeId,
                        c -> new ContractInfo(c.getType(), c.getSalaireBase(), c.getDateDebut(), c.getDateFin()),
                        (a, b) -> b));
    }

    @Override
    public Optional<Employee> findByEmail(String email) {
        return employeJpaRepository.findByEmail(email).map(mapper::toDomain);
    }

    @Override
    public Optional<Employee> findById(Long id) {
        return employeJpaRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    public List<Employee> findAllByIds(List<Long> ids) {
        if (ids.isEmpty())
            return List.of();
        return employeJpaRepository.findAllById(ids).stream().map(mapper::toDomain).toList();
    }

    @Override
    public Optional<ContractInfo> findContractByEmployeeId(Long employeId) {
        List<ContractJpaEntity> contrats = contratJpaRepository.findByEmployeIdIn(List.of(employeId));
        return contrats.stream().findFirst()
                .map(c -> new ContractInfo(c.getType(), c.getSalaireBase(), c.getDateDebut(), c.getDateFin()));
    }
}
```

#### `adapter/out/persistence/adapter/LeavePersistenceAdapter.java`

```java
package com.erp.erp.adapter.out.persistence.adapter;

import com.erp.erp.adapter.out.persistence.entity.LeaveJpaEntity;
import com.erp.erp.adapter.out.persistence.repository.LeaveJpaRepository;
import com.erp.erp.domain.model.Leave;
import com.erp.erp.domain.model.enums.LeaveStatus;
import com.erp.erp.domain.model.enums.LeaveType;
import com.erp.erp.domain.port.out.LeaveRepositoryPort;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
public class LeavePersistenceAdapter implements LeaveRepositoryPort {

    private final LeaveJpaRepository repository;

    public LeavePersistenceAdapter(LeaveJpaRepository repository) {
        this.repository = repository;
    }

    @Override
    public Leave save(Leave leave) {
        LeaveJpaEntity entity = toEntity(leave);
        LeaveJpaEntity saved = repository.save(entity);
        return toDomain(saved);
    }

    @Override
    public Optional<Leave> findById(Long id) {
        return repository.findById(id).map(this::toDomain);
    }

    @Override
    public List<Leave> findByEmployeeId(Long employeId) {
        return repository.findByEmployeIdOrderByCreatedAtDesc(employeId)
                .stream().map(this::toDomain).toList();
    }

    @Override
    public void delete(Long id) {
        repository.deleteById(id);
    }

    @Override
    public int countApprovedLeaveDaysThisYear(Long employeId, int annee) {
        return repository.countApprovedDays(employeId, annee);
    }

    @Override
    public int countPendingRequests(Long employeId) {
        return repository.countPending(employeId);
    }

    @Override
    public List<Leave> findAll() {
        return repository.findAllByOrderByCreatedAtDesc()
                .stream().map(this::toDomain).toList();
    }

    @Override
    public List<Leave> findAllFiltered(String statut) {
        return repository.findFiltered(statut).stream().map(this::toDomain).toList();
    }

    @Override
    public int countAllPending() {
        return repository.countAllPending();
    }

    @Override
    public int countAllApproved() {
        return repository.countAllApproved();
    }

    @Override
    public int countOnLeaveToday() {
        return repository.countOnLeaveToday(java.time.LocalDate.now());
    }

    @Override
    public int countPlannedThisMonth() {
        java.time.LocalDate now = java.time.LocalDate.now();
        return repository.countPlannedThisMonth(now.getYear(), now.getMonthValue());
    }

    private Leave toDomain(LeaveJpaEntity e) {
        Leave c = new Leave();
        c.setId(e.getId());
        c.setEmployeId(e.getEmployeId());
        c.setApprobateurId(e.getApprobateurId());
        c.setType(LeaveType.valueOf(e.getType()));
        c.setDateDebut(e.getDateDebut());
        c.setDateFin(e.getDateFin());
        c.setNombreJours(e.getNombreJours());
        c.setStatut(LeaveStatus.valueOf(e.getStatut()));
        c.setMotif(e.getMotif());
        c.setCreatedAt(e.getCreatedAt());
        return c;
    }

    private LeaveJpaEntity toEntity(Leave c) {
        LeaveJpaEntity e = new LeaveJpaEntity();
        e.setId(c.getId());
        e.setEmployeId(c.getEmployeId());
        e.setApprobateurId(c.getApprobateurId());
        e.setType(c.getType().name());
        e.setDateDebut(c.getDateDebut());
        e.setDateFin(c.getDateFin());
        e.setNombreJours(c.getNombreJours());
        e.setStatut(c.getStatut().name());
        e.setMotif(c.getMotif());
        return e;
    }
}
```

#### `adapter/out/persistence/adapter/PayslipPersistenceAdapter.java`

```java
package com.erp.erp.adapter.out.persistence.adapter;

import com.erp.erp.adapter.out.persistence.entity.PayslipJpaEntity;
import com.erp.erp.adapter.out.persistence.repository.PayslipJpaRepository;
import com.erp.erp.domain.model.Payslip;
import com.erp.erp.domain.model.enums.PayslipStatus;
import com.erp.erp.domain.port.out.PayslipRepositoryPort;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
public class PayslipPersistenceAdapter implements PayslipRepositoryPort {

    private final PayslipJpaRepository repository;

    public PayslipPersistenceAdapter(PayslipJpaRepository repository) {
        this.repository = repository;
    }

    @Override
    public List<Payslip> findByEmployeeId(Long employeId) {
        return repository.findByEmployeIdOrderByAnneeDescMoisDesc(employeId)
                .stream().map(this::toDomain).toList();
    }

    @Override
    public Optional<Payslip> findById(Long id) {
        return repository.findById(id).map(this::toDomain);
    }

    private Payslip toDomain(PayslipJpaEntity e) {
        Payslip f = new Payslip();
        f.setId(e.getId());
        f.setEmployeId(e.getEmployeId());
        f.setMois(e.getMois());
        f.setAnnee(e.getAnnee());
        f.setSalaireBase(e.getSalaireBase());
        f.setTotalAbsences(e.getTotalAbsences());
        f.setDeductionAbsences(e.getDeductionAbsences());
        f.setPrimePresence(e.getPrimePresence());
        f.setCotisationsTotal(e.getCotisationsTotal());
        f.setSalaireNet(e.getSalaireNet());
        f.setStatut(PayslipStatus.valueOf(e.getStatut()));
        return f;
    }
}
```


### Notification & PDF Adapters

#### `adapter/out/notification/EmailNotificationAdapter.java`

```java
package com.erp.erp.adapter.out.notification;
```

#### `adapter/out/pdf/ITextPdfGeneratorAdapter.java`

```java
package com.erp.erp.adapter.out.pdf;
```


## 9. Infrastructure Layer


### Security

#### `infrastructure/security/CustomUserDetailsService.java`

```java
package com.erp.erp.infrastructure.security;

import com.erp.erp.adapter.out.persistence.repository.UserRepository;
import com.erp.erp.domain.model.User;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.stream.Collectors;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                user.getRoles().stream()
                        .map(role -> new SimpleGrantedAuthority(role.getName()))
                        .collect(Collectors.toList())
        );
    }
}
```

#### `infrastructure/security/JwtAuthFilter.java`

```java
package com.erp.erp.infrastructure.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    public JwtAuthFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            if (jwtUtil.isTokenValid(token) && SecurityContextHolder.getContext().getAuthentication() == null) {
                String email = jwtUtil.extractEmail(token);
                List<String> roles = jwtUtil.extractRoles(token);

                List<SimpleGrantedAuthority> authorities = roles.stream()
                        .map(SimpleGrantedAuthority::new)
                        .collect(Collectors.toList());

                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        email, null, authorities);

                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }
        filterChain.doFilter(request, response);
    }
}
```

#### `infrastructure/security/JwtTokenProvider.java`

```java
package com.erp.erp.infrastructure.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
public class JwtTokenProvider {

    public Optional<String> getCurrentEmail() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof String email) {
            return Optional.of(email);
        }
        return Optional.empty();
    }

    public Optional<String> getCurrentUserId() {
        return getCurrentEmail(); // Now we use email as ID
    }

    public Optional<String> getCurrentUsername() {
        return getCurrentEmail();
    }

    public List<String> getCurrentRoles() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getAuthorities() != null) {
            return auth.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .collect(Collectors.toList());
        }
        return List.of();
    }

    public boolean hasRole(String role) {
        return getCurrentRoles().contains(role);
    }

    public boolean isAdmin()   { return hasRole("admin"); }
    public boolean isRh()      { return hasRole("rh"); }
    public boolean isEmploye() { return hasRole("employe"); }
}
```

#### `infrastructure/security/JwtUtil.java`

```java
package com.erp.erp.infrastructure.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.List;

@Component
public class JwtUtil {

    @Value("${jwt.secret:thisismysecretkeyforjwtauthenticationwhichneedstobelongenough}")
    private String secret;

    @Value("${jwt.expiration:86400000}")
    private long expiration;

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }

    public String generateToken(String email, List<String> roles) {
        return Jwts.builder()
                .subject(email)
                .claim("roles", roles)
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSigningKey())
                .compact();
    }

    public String extractEmail(String token) {
        return extractAllClaims(token).getSubject();
    }

    @SuppressWarnings("unchecked")
    public List<String> extractRoles(String token) {
        return extractAllClaims(token).get("roles", List.class);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public boolean isTokenValid(String token) {
        try {
            return !extractAllClaims(token).getExpiration().before(new Date());
        } catch (Exception e) {
            return false;
        }
    }
}
```


### Configuration

#### `infrastructure/config/BeanConfig.java`

```java
package com.erp.erp.infrastructure.config;


import com.erp.erp.domain.port.in.absence.GetAbsenceUseCase;
import com.erp.erp.domain.port.in.department.CreateDepartmentUseCase;
import com.erp.erp.domain.port.in.department.GetDepartmentUseCase;
import com.erp.erp.domain.port.in.department.UpdateDepartmentUseCase;
import com.erp.erp.domain.port.in.employee.CreateEmployeeUseCase;
import com.erp.erp.domain.port.in.employee.ListEmployeesUseCase;
import com.erp.erp.domain.port.in.leave.ApproveLeaveUseCase;
import com.erp.erp.domain.port.in.leave.GetLeaveUseCase;
import com.erp.erp.domain.port.in.leave.RejectLeaveUseCase;
import com.erp.erp.domain.port.in.leave.RequestLeaveUseCase;
import com.erp.erp.domain.port.out.AbsenceRepositoryPort;
import com.erp.erp.domain.port.out.LeaveRepositoryPort;
import com.erp.erp.domain.port.out.DepartmentRepositoryPort;
import com.erp.erp.domain.port.out.EmployeeRepositoryPort;
import com.erp.erp.domain.port.out.PayslipRepositoryPort;

import com.erp.erp.domain.service.AbsenceService;
import com.erp.erp.domain.service.LeaveService;
import com.erp.erp.domain.service.DepartmentService;
import com.erp.erp.domain.service.EmployeeService;
import com.erp.erp.domain.service.PayrollService;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.annotation.EnableTransactionManagement;

@Configuration
@EnableTransactionManagement
public class BeanConfig {



    @Bean
    public EmployeeService employeeService(EmployeeRepositoryPort employeeRepositoryPort) {
        return new EmployeeService(employeeRepositoryPort);
    }

    @Bean
    public CreateEmployeeUseCase createEmployeeUseCase(EmployeeService employeeService) {
        return employeeService;
    }

    @Bean
    public ListEmployeesUseCase listEmployeesUseCase(EmployeeService employeeService) {
        return employeeService;
    }

    @Bean
    public DepartmentService departmentService(DepartmentRepositoryPort departmentRepositoryPort) {
        return new DepartmentService(departmentRepositoryPort);
    }

    @Bean
    public GetDepartmentUseCase getDepartmentUseCase(DepartmentService departmentService) {
        return departmentService;
    }

    @Bean
    public CreateDepartmentUseCase createDepartmentUseCase(DepartmentService departmentService) {
        return departmentService;
    }

    @Bean
    public UpdateDepartmentUseCase updateDepartmentUseCase(DepartmentService departmentService) {
        return departmentService;
    }

    @Bean
    public LeaveService leaveService(LeaveRepositoryPort leaveRepositoryPort) {
        return new LeaveService(leaveRepositoryPort);
    }

    @Bean
    public RequestLeaveUseCase requestLeaveUseCase(LeaveService leaveService) {
        return leaveService;
    }

    @Bean
    public GetLeaveUseCase getLeaveUseCase(LeaveService leaveService) {
        return leaveService;
    }

    @Bean
    public ApproveLeaveUseCase approveLeaveUseCase(LeaveService leaveService) {
        return leaveService;
    }

    @Bean
    public RejectLeaveUseCase rejectLeaveUseCase(LeaveService leaveService) {
        return leaveService;
    }

    @Bean
    public AbsenceService absenceService(AbsenceRepositoryPort absenceRepositoryPort) {
        return new AbsenceService(absenceRepositoryPort);
    }

    @Bean
    public GetAbsenceUseCase getAbsenceUseCase(AbsenceService absenceService) {
        return absenceService;
    }

    @Bean
    public PayrollService payrollService(PayslipRepositoryPort payslipRepositoryPort) {
        return new PayrollService(payslipRepositoryPort);
    }
}
```

#### `infrastructure/config/DataSeeder.java`

```java
package com.erp.erp.infrastructure.config;

import com.erp.erp.adapter.out.persistence.repository.RoleRepository;
import com.erp.erp.adapter.out.persistence.repository.UserRepository;
import com.erp.erp.domain.model.Role;
import com.erp.erp.domain.model.User;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Set;

@Component
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(UserRepository userRepository, RoleRepository roleRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (roleRepository.count() == 0) {
            Role adminRole = new Role(null, "admin");
            Role userRole = new Role(null, "employe");
            Role rhRole = new Role(null, "rh");
            roleRepository.saveAll(Set.of(adminRole, userRole, rhRole));
        }

        if (userRepository.count() == 0) {
            Role adminRole = roleRepository.findByName("admin").orElseThrow();
            User admin = new User();
            admin.setEmail("admin@erp.com");
            admin.setPassword(passwordEncoder.encode("admin"));
            admin.getRoles().add(adminRole);
            userRepository.save(admin);
        }
    }
}
```

#### `infrastructure/config/SecurityConfig.java`

```java
package com.erp.erp.infrastructure.config;

import com.erp.erp.infrastructure.security.JwtAuthFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.config.core.GrantedAuthorityDefaults;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final UserDetailsService userDetailsService;

    public SecurityConfig(JwtAuthFilter jwtAuthFilter, UserDetailsService userDetailsService) {
        this.jwtAuthFilter = jwtAuthFilter;
        this.userDetailsService = userDetailsService;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public GrantedAuthorityDefaults grantedAuthorityDefaults() {
        return new org.springframework.security.config.core.GrantedAuthorityDefaults("");
    }

    @Bean
    public AuthenticationManager authenticationManager() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return new ProviderManager(authProvider);
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/actuator/health", "/api/v1/auth/login").permitAll()
                        .anyRequest().authenticated())
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
```


### Exceptions

#### `infrastructure/exception/exceptions/EmployeeNotFoundException.java`

```java
package com.erp.erp.infrastructure.exception.exceptions;

public class EmployeeNotFoundException extends RuntimeException {
    public EmployeeNotFoundException(String message) {
        super(message);
    }
}
```

#### `infrastructure/exception/exceptions/LeaveConflictException.java`

```java
package com.erp.erp.infrastructure.exception.exceptions;

public class LeaveConflictException extends RuntimeException {
    public LeaveConflictException(String message) {
        super(message);
    }
}
```

#### `infrastructure/exception/exceptions/LeaveNotFoundException.java`

```java
package com.erp.erp.infrastructure.exception.exceptions;

public class LeaveNotFoundException extends RuntimeException {
    public LeaveNotFoundException(Long id) {
        super("Congé introuvable : id=" + id);
    }
}
```

#### `infrastructure/exception/exceptions/UnauthorizedException.java`

```java
package com.erp.erp.infrastructure.exception.exceptions;

public class UnauthorizedException extends RuntimeException {
    public UnauthorizedException(String message) {
        super(message);
    }
}
```


## 10. Configuration Files


### `build.gradle`

```groovy
plugins {
    id 'java'
    id 'org.springframework.boot' version '4.0.3'
    id 'io.spring.dependency-management' version '1.1.7'
}

group = 'com.erp'
version = '0.0.1-SNAPSHOT'
description = 'ERP'

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(21)
    }
}

configurations {
    compileOnly {
        extendsFrom annotationProcessor
    }
}

repositories {
    mavenCentral()
}

dependencies {
    implementation 'org.springframework.boot:spring-boot-starter'
    implementation 'org.springframework.boot:spring-boot-starter-web'
    implementation 'org.springframework.boot:spring-boot-starter-data-jpa'
    implementation 'org.springframework.boot:spring-boot-starter-security'
    implementation 'org.springframework.boot:spring-boot-starter-validation'
    implementation 'org.mapstruct:mapstruct:1.6.3'
    runtimeOnly 'org.postgresql:postgresql'
    implementation 'io.jsonwebtoken:jjwt-api:0.12.5'
    runtimeOnly 'io.jsonwebtoken:jjwt-impl:0.12.5'
    runtimeOnly 'io.jsonwebtoken:jjwt-jackson:0.12.5'
    compileOnly 'org.projectlombok:lombok'
    testImplementation 'org.springframework.boot:spring-boot-starter-test'
    testImplementation 'org.springframework.security:spring-security-test'
    testImplementation 'com.fasterxml.jackson.core:jackson-databind'
    testImplementation 'com.fasterxml.jackson.datatype:jackson-datatype-jsr310'
    annotationProcessor 'org.projectlombok:lombok'
    annotationProcessor 'org.projectlombok:lombok-mapstruct-binding:0.2.0'
    annotationProcessor 'org.mapstruct:mapstruct-processor:1.6.3'
    testRuntimeOnly 'org.junit.platform:junit-platform-launcher'
}

tasks.named('test') {
    useJUnitPlatform()
}

bootRun {
    def envFile = rootProject.file('../.env')
    if (envFile.exists()) {
        envFile.readLines().each { line ->
            if (line && !line.startsWith('#') && line.contains('=')) {
                def idx = line.indexOf('=')
                def key = line.substring(0, idx).trim()
                def value = line.substring(idx + 1).trim()
                environment key, value
            }
        }
    }
}
```


### `src\main\resources\application.yaml`

```yaml
spring:
  application:
    name: ERP

  datasource:
    url: ${SPRING_DATASOURCE_URL:jdbc:postgresql://localhost:5432/${POSTGRES_DB:erp_db}}
    username: ${SPRING_DATASOURCE_USERNAME:${POSTGRES_USER:erp_user}}
    password: ${SPRING_DATASOURCE_PASSWORD:${POSTGRES_PASSWORD:${POSTGRES_USER_PASSWORD:erp_password}}}

  jpa:
    hibernate:
      ddl-auto: update
    show-sql: false
    properties:
      hibernate:
        format_sql: true
        dialect: org.hibernate.dialect.PostgreSQLDialect

jwt:
  secret: ${JWT_SECRET:thisismysecretkeyforjwtauthenticationwhichneedstobelongenough}
  expiration: ${JWT_EXPIRATION:86400000}

version:
  path: v1

server:
  port: 8080
```


### `src\main\resources\banner.txt`

```text
______  ______  ______
     /  __  \/  __  \/  __  \
    |  /  \  |  /  \  |  /  \
    |  \__/  |  \__/  |  \__/
     \______/ \______/ \______/
              ERP SYSTEM
              v${spring-boot.version}
```


## 11. Main Application Entry


### `ErpApplication.java`

```java
package com.erp.erp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ErpApplication {

    public static void main(String[] args) {
        SpringApplication.run(ErpApplication.class, args);
    }

}
```
