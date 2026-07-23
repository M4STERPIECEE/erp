package com.erp.erp.adapter.out.persistence.adapter;

import com.erp.erp.adapter.out.persistence.entity.LeaveJpaEntity;
import com.erp.erp.adapter.out.persistence.mapper.LeaveJpaMapper;
import com.erp.erp.adapter.out.persistence.repository.LeaveJpaRepository;
import com.erp.erp.domain.model.Leave;
import com.erp.erp.domain.port.out.LeaveRepositoryPort;
import org.springframework.stereotype.Component;
import java.util.List;
import java.util.Optional;

@Component
public class LeavePersistenceAdapter implements LeaveRepositoryPort {

    private final LeaveJpaRepository repository;
    private final LeaveJpaMapper mapper;

    public LeavePersistenceAdapter(LeaveJpaRepository repository, LeaveJpaMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    @Override
    public Leave save(Leave leave) {
        LeaveJpaEntity entity = mapper.toEntity(leave);
        LeaveJpaEntity saved = repository.save(entity);
        return mapper.toDomain(saved);
    }

    @Override
    public Optional<Leave> findById(Long id) {
        return repository.findById(id).map(mapper::toDomain);
    }

    @Override
    public List<Leave> findByEmployeeId(Long employeId) {
        return repository.findByEmployeIdOrderByCreatedAtDesc(employeId)
                .stream().map(mapper::toDomain).toList();
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
                .stream().map(mapper::toDomain).toList();
    }

    @Override
    public List<Leave> findAllFiltered(String statut) {
        return repository.findFiltered(statut).stream().map(mapper::toDomain).toList();
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
}
