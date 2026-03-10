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
