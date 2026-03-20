package com.erp.erp.application.result;

import java.time.LocalDate;

public record AbsenceResult(
        Long id,
        LocalDate date,
        String motif,
        boolean justifiee
) {}
