package com.erp.erp.domain.port.in.leave;

import com.erp.erp.domain.model.Leave;

import java.util.List;
import java.util.Optional;

public interface GetLeaveUseCase {
    List<Leave> listEmployeeLeaves(Long employeId);
    List<Leave> listAllLeavesFiltered(String statut);
    Optional<Leave> findById(Long id);
    int countLeaveDaysTakenThisYear(Long employeId);
    int countPendingRequests(Long employeId);
    int countAllPending();
    int countAllApproved();
    int countOnLeaveToday();
    int countPlannedThisMonth();
}
