package com.erp.erp.domain.port.in.leave;

import com.erp.erp.domain.model.Leave;

public interface ApproveLeaveUseCase {
    Leave approveLeave(Long id, Long approbateurId);
}
