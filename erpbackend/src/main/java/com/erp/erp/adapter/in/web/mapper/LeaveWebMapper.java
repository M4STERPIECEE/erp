package com.erp.erp.adapter.in.web.mapper;

import com.erp.erp.application.result.LeaveResult;
import com.erp.erp.domain.model.Leave;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface LeaveWebMapper {

    @Mapping(target = "dateDemande", expression = "java(leave.getCreatedAt() != null ? leave.getCreatedAt().toLocalDate() : null)")
    LeaveResult toResult(Leave leave);
}