package com.erp.erp.adapter.in.web.mapper;

import com.erp.erp.application.result.AbsenceResult;
import com.erp.erp.domain.model.Absence;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface AbsenceWebMapper {

    AbsenceResult toResult(Absence absence);
}