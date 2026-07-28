package com.erp.erp.adapter.in.web.dto.request;

import java.time.LocalDate;

public record RequestLeaveRequest(String type, LocalDate dateDebut, LocalDate dateFin, String motif) {
}