package com.erp.erp.domain.port.in.leave;

import com.erp.erp.domain.model.Leave;

public interface RejectLeaveUseCase {
    Leave rejectLeave(Long id, Long approbateurId);
}
