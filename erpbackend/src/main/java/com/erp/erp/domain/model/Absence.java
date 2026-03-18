package com.erp.erp.domain.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Absence {
    private Long id;
    private Long employeId;
    private LocalDate date;
    private String motif;
    private boolean justifiee;
}
