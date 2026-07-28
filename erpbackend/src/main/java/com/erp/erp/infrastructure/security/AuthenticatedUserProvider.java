package com.erp.erp.infrastructure.security;

import com.erp.erp.domain.exception.EmployeeNotFoundException;
import com.erp.erp.domain.exception.UnauthorizedException;
import com.erp.erp.domain.model.Employee;
import com.erp.erp.domain.port.in.employee.GetEmployeeByEmailUseCase;
import org.springframework.stereotype.Component;

@Component
public class AuthenticatedUserProvider {

    private final JwtTokenProvider jwtTokenProvider;
    private final GetEmployeeByEmailUseCase getEmployeeByEmailUseCase;

    public AuthenticatedUserProvider(JwtTokenProvider jwtTokenProvider,
            GetEmployeeByEmailUseCase getEmployeeByEmailUseCase) {
        this.jwtTokenProvider = jwtTokenProvider;
        this.getEmployeeByEmailUseCase = getEmployeeByEmailUseCase;
    }

    public Employee getAuthenticatedEmployee() {
        String email = jwtTokenProvider.getCurrentEmail()
                .orElseThrow(() -> new UnauthorizedException("Utilisateur non authentifié"));
        return getEmployeeByEmailUseCase.findByEmail(email)
                .orElseThrow(() -> new EmployeeNotFoundException("Profil employé introuvable"));
    }

    public Long getAuthenticatedEmployeeId() {
        String email = jwtTokenProvider.getCurrentEmail().orElse(null);
        if (email == null) return null;
        return getEmployeeByEmailUseCase.findByEmail(email)
                .map(Employee::getId)
                .orElse(null);
    }
}