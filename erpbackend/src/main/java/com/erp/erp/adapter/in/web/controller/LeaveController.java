package com.erp.erp.adapter.in.web.controller;

import com.erp.erp.adapter.in.web.dto.request.RequestLeaveRequest;
import com.erp.erp.adapter.in.web.dto.response.AdminStatsResponse;
import com.erp.erp.adapter.in.web.dto.response.LeaveStatsResponse;
import com.erp.erp.adapter.in.web.mapper.LeaveWebMapper;
import com.erp.erp.application.result.AdminLeaveResult;
import com.erp.erp.application.result.LeaveResult;
import com.erp.erp.domain.model.Employee;
import com.erp.erp.domain.model.Leave;
import com.erp.erp.domain.port.in.leave.ApproveLeaveUseCase;
import com.erp.erp.domain.port.in.leave.GetLeaveUseCase;
import com.erp.erp.domain.port.in.leave.RejectLeaveUseCase;
import com.erp.erp.domain.port.in.leave.RequestLeaveUseCase;
import com.erp.erp.infrastructure.security.AuthenticatedUserProvider;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/${version.path}/leaves")
public class LeaveController {

    private final RequestLeaveUseCase requestLeaveUseCase;
    private final GetLeaveUseCase getLeaveUseCase;
    private final ApproveLeaveUseCase approveLeaveUseCase;
    private final RejectLeaveUseCase rejectLeaveUseCase;
    private final LeaveWebMapper leaveWebMapper;
    private final AuthenticatedUserProvider authenticatedUserProvider;

    public LeaveController(RequestLeaveUseCase requestLeaveUseCase,
            GetLeaveUseCase getLeaveUseCase,
            ApproveLeaveUseCase approveLeaveUseCase,
            RejectLeaveUseCase rejectLeaveUseCase,
            LeaveWebMapper leaveWebMapper,
            AuthenticatedUserProvider authenticatedUserProvider) {
        this.requestLeaveUseCase = requestLeaveUseCase;
        this.getLeaveUseCase = getLeaveUseCase;
        this.approveLeaveUseCase = approveLeaveUseCase;
        this.rejectLeaveUseCase = rejectLeaveUseCase;
        this.leaveWebMapper = leaveWebMapper;
        this.authenticatedUserProvider = authenticatedUserProvider;
    }

    @GetMapping("/my-leaves")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<LeaveResult>> myLeaves() {
        Employee employee = authenticatedUserProvider.getAuthenticatedEmployee();
        List<LeaveResult> results = getLeaveUseCase.listEmployeeLeaves(employee.getId()).stream().map(leaveWebMapper::toResult).toList();
        return ResponseEntity.ok(results);
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<LeaveResult> requestLeave(@RequestBody RequestLeaveRequest request) {
        Employee employee = authenticatedUserProvider.getAuthenticatedEmployee();
        Leave leave = requestLeaveUseCase.requestLeave(employee.getId(), request.type(), request.dateDebut(), request.dateFin(), request.motif());
        return ResponseEntity.status(HttpStatus.CREATED).body(leaveWebMapper.toResult(leave));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> cancelLeave(@PathVariable Long id) {
        Employee employee = authenticatedUserProvider.getAuthenticatedEmployee();
        requestLeaveUseCase.cancelLeave(id, employee.getId());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/stats")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<LeaveStatsResponse> leaveStats() {
        Employee employee = authenticatedUserProvider.getAuthenticatedEmployee();
        int daysTaken = getLeaveUseCase.countLeaveDaysTakenThisYear(employee.getId());
        int pending = getLeaveUseCase.countPendingRequests(employee.getId());
        int balance = 30 - daysTaken;
        return ResponseEntity.ok(new LeaveStatsResponse(daysTaken, pending, Math.max(balance, 0)));
    }

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
    public ResponseEntity<AdminStatsResponse> adminStats() {
        return ResponseEntity.ok(new AdminStatsResponse(
                getLeaveUseCase.countAllPending(),
                getLeaveUseCase.countAllApproved(),
                getLeaveUseCase.countOnLeaveToday(),
                getLeaveUseCase.countPlannedThisMonth()));
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<LeaveResult> approveLeave(@PathVariable Long id) {
        Long approbateurId = authenticatedUserProvider.getAuthenticatedEmployeeId();
        Leave leave = approveLeaveUseCase.approveLeave(id, approbateurId);
        return ResponseEntity.ok(leaveWebMapper.toResult(leave));
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<LeaveResult> rejectLeave(@PathVariable Long id) {
        Long approbateurId = authenticatedUserProvider.getAuthenticatedEmployeeId();
        Leave leave = rejectLeaveUseCase.rejectLeave(id, approbateurId);
        return ResponseEntity.ok(leaveWebMapper.toResult(leave));
    }
}