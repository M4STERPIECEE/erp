package com.erp.erp.infrastructure.config;

import com.erp.erp.adapter.out.keycloak.KeycloakAdapter;
import com.erp.erp.domain.port.in.employe.CreateEmployeUseCase;
import com.erp.erp.domain.port.in.employe.ListEmployesUseCase;
import com.erp.erp.domain.port.out.EmployeRepositoryPort;
import com.erp.erp.domain.port.out.DepartementRepositoryPort;
import com.erp.erp.domain.port.out.KeycloakPort;
import com.erp.erp.domain.service.DepartementService;
import com.erp.erp.domain.service.EmployeService;
import org.keycloak.admin.client.Keycloak;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.annotation.EnableTransactionManagement;

@Configuration
@EnableTransactionManagement
public class BeanConfig {

    @Bean
    public KeycloakPort keycloakPort(Keycloak keycloakAdminClient,
                                     @Value("${keycloak.admin.realm}") String realm) {
        return new KeycloakAdapter(keycloakAdminClient, realm);
    }

    @Bean
    public EmployeService employeService(KeycloakPort keycloakPort,
                                         EmployeRepositoryPort employeRepositoryPort) {
        return new EmployeService(keycloakPort, employeRepositoryPort);
    }

    @Bean
    public CreateEmployeUseCase createEmployeUseCase(EmployeService employeService) {
        return employeService;
    }

    @Bean
    public ListEmployesUseCase listEmployesUseCase(EmployeService employeService) {
        return employeService;
    }

    @Bean
    public DepartementService departementService(DepartementRepositoryPort departementRepositoryPort) {
        return new DepartementService(departementRepositoryPort);
    }
}
