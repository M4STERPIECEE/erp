package com.erp.erp.domain.exception;

public class LeaveNotFoundException extends DomainException {
    public LeaveNotFoundException(Long id) {
        super("Congé introuvable avec l'identifiant : " + id);
    }
}
