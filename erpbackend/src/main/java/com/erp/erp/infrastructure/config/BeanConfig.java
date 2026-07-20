package com.erp.erp.infrastructure.config;


import com.erp.erp.domain.port.in.absence.GetAbsenceUseCase;
import com.erp.erp.domain.port.in.department.CreateDepartmentUseCase;
import com.erp.erp.domain.port.in.department.GetDepartmentUseCase;
import com.erp.erp.domain.port.in.department.UpdateDepartmentUseCase;
import com.erp.erp.domain.port.in.employee.CreateEmployeeUseCase;
import com.erp.erp.domain.port.in.employee.ListEmployeesUseCase;
import com.erp.erp.domain.port.in.leave.ApproveLeaveUseCase;
import com.erp.erp.domain.port.in.leave.GetLeaveUseCase;
import com.erp.erp.domain.port.in.leave.RejectLeaveUseCase;
import com.erp.erp.domain.port.in.leave.RequestLeaveUseCase;
import com.erp.erp.domain.port.out.AbsenceRepositoryPort;
import com.erp.erp.domain.port.out.LeaveRepositoryPort;
import com.erp.erp.domain.port.out.DepartmentRepositoryPort;
import com.erp.erp.domain.port.out.EmployeeRepositoryPort;
import com.erp.erp.domain.port.out.PayslipRepositoryPort;

import com.erp.erp.domain.service.AbsenceService;
import com.erp.erp.domain.service.LeaveService;
import com.erp.erp.domain.service.DepartmentService;
import com.erp.erp.domain.service.EmployeeService;
import com.erp.erp.domain.service.PayrollService;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.annotation.EnableTransactionManagement;

@Configuration
@EnableTransactionManagement
public class BeanConfig {



    @Bean
    public EmployeeService employeeService(EmployeeRepositoryPort employeeRepositoryPort) {
        return new EmployeeService(employeeRepositoryPort);
    }

    @Bean
    public CreateEmployeeUseCase createEmployeeUseCase(EmployeeService employeeService) {
        return employeeService;
    }

    @Bean
    public ListEmployeesUseCase listEmployeesUseCase(EmployeeService employeeService) {
        return employeeService;
    }

    @Bean
    public DepartmentService departmentService(DepartmentRepositoryPort departmentRepositoryPort) {
        return new DepartmentService(departmentRepositoryPort);
    }

    @Bean
    public GetDepartmentUseCase getDepartmentUseCase(DepartmentService departmentService) {
        return departmentService;
    }

    @Bean
    public CreateDepartmentUseCase createDepartmentUseCase(DepartmentService departmentService) {
        return departmentService;
    }

    @Bean
    public UpdateDepartmentUseCase updateDepartmentUseCase(DepartmentService departmentService) {
        return departmentService;
    }

    @Bean
    public LeaveService leaveService(LeaveRepositoryPort leaveRepositoryPort) {
        return new LeaveService(leaveRepositoryPort);
    }

    @Bean
    public RequestLeaveUseCase requestLeaveUseCase(LeaveService leaveService) {
        return leaveService;
    }

    @Bean
    public GetLeaveUseCase getLeaveUseCase(LeaveService leaveService) {
        return leaveService;
    }

    @Bean
    public ApproveLeaveUseCase approveLeaveUseCase(LeaveService leaveService) {
        return leaveService;
    }

    @Bean
    public RejectLeaveUseCase rejectLeaveUseCase(LeaveService leaveService) {
        return leaveService;
    }

    @Bean
    public AbsenceService absenceService(AbsenceRepositoryPort absenceRepositoryPort) {
        return new AbsenceService(absenceRepositoryPort);
    }

    @Bean
    public GetAbsenceUseCase getAbsenceUseCase(AbsenceService absenceService) {
        return absenceService;
    }

    @Bean
    public PayrollService payrollService(PayslipRepositoryPort payslipRepositoryPort) {
        return new PayrollService(payslipRepositoryPort);
    }
}
