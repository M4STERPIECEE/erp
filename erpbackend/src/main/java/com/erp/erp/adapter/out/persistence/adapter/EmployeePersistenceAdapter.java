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
    public Employee sauvegarder(Employee employee) {
        EmployeeJpaEntity entity = mapper.toEntity(employee);
        EmployeeJpaEntity saved = employeJpaRepository.save(entity);
        return mapper.toDomain(saved);
    }

    @Override
    public void sauvegarderContrat(Long employeId, ContractType type, BigDecimal salaireBase,
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
    public boolean existeParEmail(String email) {
        return employeJpaRepository.existsByEmail(email);
    }

    @Override
    public long compterEmployes() {
        return employeJpaRepository.count();
    }

    @Override
    public PageResult<Employee> rechercherEmployes(String search, Long departementId, String statut, int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<EmployeeJpaEntity> jpaPage = employeJpaRepository.rechercher(search, departementId, statut, pageRequest);

        List<Employee> employes = jpaPage.getContent().stream()
                .map(mapper::toDomain)
                .toList();

        return new PageResult<>(employes, jpaPage.getTotalElements(), jpaPage.getTotalPages(), jpaPage.getNumber(), jpaPage.getSize());
    }

    @Override
    public Map<Long, ContratInfo> trouverContratsPourEmployes(List<Long> employeIds) {
        if (employeIds.isEmpty()) return Map.of();

        List<ContractJpaEntity> contrats = contratJpaRepository.findByEmployeIdIn(employeIds);
        return contrats.stream()
                .collect(Collectors.toMap(
                        ContractJpaEntity::getEmployeId,
                        c -> new ContratInfo(c.getType(), c.getSalaireBase(), c.getDateDebut(), c.getDateFin()),
                        (a, b) -> b
                ));
    }

    @Override
    public Optional<Employee> trouverParKeycloakId(String keycloakId) {
        return employeJpaRepository.findByKeycloakId(keycloakId).map(mapper::toDomain);
    }

    @Override
    public Optional<ContratInfo> trouverContratParEmployeId(Long employeId) {
        List<ContractJpaEntity> contrats = contratJpaRepository.findByEmployeIdIn(List.of(employeId));
        return contrats.stream().findFirst()
                .map(c -> new ContratInfo(c.getType(), c.getSalaireBase(), c.getDateDebut(), c.getDateFin()));
    }
}
