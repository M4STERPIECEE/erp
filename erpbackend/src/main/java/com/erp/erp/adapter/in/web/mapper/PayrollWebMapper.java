package com.erp.erp.adapter.in.web.mapper;

import com.erp.erp.application.result.PayslipResult;
import com.erp.erp.domain.model.Payslip;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface PayrollWebMapper {

    PayslipResult toResult(Payslip payslip);
}