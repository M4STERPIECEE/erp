package com.erp.erp.domain.port.in.leave;

import com.erp.erp.domain.model.Leave;

import java.time.LocalDate;

public interface RequestLeaveUseCase {
    Leave requestLeave(Long employeId, String type, LocalDate dateDebut, LocalDate dateFin, String motif);
    void cancelLeave(Long id, Long employeId);
}
