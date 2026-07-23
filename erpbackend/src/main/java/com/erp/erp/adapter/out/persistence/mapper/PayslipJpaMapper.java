package com.erp.erp.adapter.out.persistence.mapper;

import com.erp.erp.adapter.out.persistence.entity.PayslipJpaEntity;
import com.erp.erp.domain.model.Payslip;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface PayslipJpaMapper {

    @Mapping(target = "statut", expression = "java(entity.getStatut() != null ? com.erp.erp.domain.model.enums.PayslipStatus.valueOf(entity.getStatut()) : null)")
    Payslip toDomain(PayslipJpaEntity entity);

    @Mapping(target = "statut", expression = "java(payslip.getStatut() != null ? payslip.getStatut().name() : null)")
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    PayslipJpaEntity toEntity(Payslip payslip);
}
