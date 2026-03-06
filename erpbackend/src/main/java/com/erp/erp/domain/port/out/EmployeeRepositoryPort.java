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
    boolean existsByEmail(String email);
    long countEmployees();
    PageResult<Employee> searchEmployees(String search, Long departementId, String statut, int page, int size);
    Map<Long, ContractInfo> findContractsForEmployees(List<Long> employeIds);
    Optional<Employee> findByKeycloakId(String keycloakId);
    Optional<Employee> findByEmail(String email);
    Optional<Employee> findById(Long id);
    List<Employee> findAllByIds(List<Long> ids);
    Optional<ContractInfo> findContractByEmployeeId(Long employeId);

    record ContractInfo(String type, BigDecimal salaireBase, LocalDate dateDebut, LocalDate dateFin) {}
}
