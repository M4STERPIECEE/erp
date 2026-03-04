package com.erp.erp.application.command;

import java.time.LocalDate;

public record RequestLeaveCommand(
        String type,
        LocalDate dateDebut,
        LocalDate dateFin,
        String motif
) {}
