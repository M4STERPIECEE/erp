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
