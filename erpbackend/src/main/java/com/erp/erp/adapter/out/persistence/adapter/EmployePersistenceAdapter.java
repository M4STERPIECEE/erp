package com.erp.erp.adapter.out.persistence.adapter;

import com.erp.erp.adapter.out.persistence.entity.ContratJpaEntity;
import com.erp.erp.adapter.out.persistence.entity.EmployeJpaEntity;
import com.erp.erp.adapter.out.persistence.mapper.EmployeJpaMapper;
import com.erp.erp.adapter.out.persistence.repository.ContratJpaRepository;
import com.erp.erp.adapter.out.persistence.repository.EmployeJpaRepository;
import com.erp.erp.domain.model.Employe;
import com.erp.erp.domain.model.PageResult;
import com.erp.erp.domain.model.enums.TypeContrat;
import com.erp.erp.domain.port.out.EmployeRepositoryPort;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
public class EmployePersistenceAdapter implements EmployeRepositoryPort {

    private final EmployeJpaRepository employeJpaRepository;
    private final ContratJpaRepository contratJpaRepository;
    private final EmployeJpaMapper mapper;

    public EmployePersistenceAdapter(EmployeJpaRepository employeJpaRepository,
                                     ContratJpaRepository contratJpaRepository,
                                     EmployeJpaMapper mapper) {
        this.employeJpaRepository = employeJpaRepository;
        this.contratJpaRepository = contratJpaRepository;
        this.mapper = mapper;
    }

    @Override
    public Employe sauvegarder(Employe employe) {
        EmployeJpaEntity entity = mapper.toEntity(employe);
        EmployeJpaEntity saved = employeJpaRepository.save(entity);
        return mapper.toDomain(saved);
    }

    @Override
    public void sauvegarderContrat(Long employeId, TypeContrat type, BigDecimal salaireBase,
                                   LocalDate dateDebut, LocalDate dateFin) {
        ContratJpaEntity contrat = new ContratJpaEntity();
        contrat.setEmployeId(employeId);
        contrat.setType(type.name());
        contrat.setSalaireBase(salaireBase);
        contrat.setDateDebut(dateDebut);
        contrat.setDateFin(dateFin);
        contratJpaRepository.save(contrat);
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
    public PageResult<Employe> rechercherEmployes(String search, Long departementId, String statut, int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<EmployeJpaEntity> jpaPage = employeJpaRepository.rechercher(search, departementId, statut, pageRequest);

        List<Employe> employes = jpaPage.getContent().stream()
                .map(mapper::toDomain)
                .toList();

        return new PageResult<>(employes, jpaPage.getTotalElements(), jpaPage.getTotalPages(), jpaPage.getNumber(), jpaPage.getSize());
    }

    @Override
    public Map<Long, ContratInfo> trouverContratsPourEmployes(List<Long> employeIds) {
        if (employeIds.isEmpty()) return Map.of();

        List<ContratJpaEntity> contrats = contratJpaRepository.findByEmployeIdIn(employeIds);
        return contrats.stream()
                .collect(Collectors.toMap(
                        ContratJpaEntity::getEmployeId,
                        c -> new ContratInfo(c.getType(), c.getSalaireBase()),
                        (a, b) -> b // keep latest if duplicates
                ));
    }
}
