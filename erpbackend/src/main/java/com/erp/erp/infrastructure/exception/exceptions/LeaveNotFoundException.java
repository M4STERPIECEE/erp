package com.erp.erp.infrastructure.exception.exceptions;

public class LeaveNotFoundException extends RuntimeException {
    public LeaveNotFoundException(Long id) {
        super("Congé introuvable : id=" + id);
    }
}
