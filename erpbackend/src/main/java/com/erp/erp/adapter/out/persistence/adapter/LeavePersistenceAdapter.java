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
