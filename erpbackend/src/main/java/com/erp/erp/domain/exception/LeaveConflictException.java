package com.erp.erp.domain.exception;

public class LeaveConflictException extends RuntimeException {
    public LeaveConflictException(String message) {
        super(message);
    }
}
