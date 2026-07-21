package com.erp.erp.adapter.in.web.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import com.erp.erp.adapter.in.web.dto.request.CreateEmployeeRequest;
import com.erp.erp.adapter.in.web.dto.response.EmployeeResponse;
import com.erp.erp.adapter.in.web.mapper.EmployeeWebMapper;
import com.erp.erp.application.command.CreateEmployeeCommand;
import com.erp.erp.application.result.EmployeeResult;
import com.erp.erp.domain.model.Employee;
import com.erp.erp.domain.port.in.employee.CreateEmployeeUseCase;
import com.erp.erp.domain.port.in.employee.GetEmployeeByEmailUseCase;
import com.erp.erp.domain.port.in.employee.GetEmployeeByIdUseCase;
import com.erp.erp.domain.port.in.employee.GetEmployeeContractUseCase;
import com.erp.erp.domain.port.in.employee.GetEmployeeStatsUseCase;
import com.erp.erp.domain.port.in.employee.ListEmployeesUseCase;
import com.erp.erp.domain.port.out.EmployeeRepositoryPort;
import com.erp.erp.domain.service.DepartmentService;
import com.erp.erp.infrastructure.security.JwtTokenProvider;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.test.web.servlet.MockMvc;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.test.context.TestPropertySource;
import com.erp.erp.adapter.in.web.exception.GlobalExceptionHandler;

@ExtendWith(SpringExtension.class)
@TestPropertySource(properties = "version.path=v1")
class EmployeeControllerTest {

    private MockMvc mockMvc;
    private EmployeeController employeeController;
    private final ObjectMapper objectMapper = new ObjectMapper().registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule());
    @MockitoBean private CreateEmployeeUseCase createEmployeeUseCase;
    @MockitoBean private ListEmployeesUseCase listEmployeesUseCase;
    @MockitoBean private GetEmployeeByEmailUseCase getEmployeeByEmailUseCase;
    @MockitoBean private GetEmployeeByIdUseCase getEmployeeByIdUseCase;
    @MockitoBean private GetEmployeeContractUseCase getEmployeeContractUseCase;
    @MockitoBean private GetEmployeeStatsUseCase getEmployeeStatsUseCase;
    @MockitoBean private EmployeeWebMapper mapper;
    @MockitoBean private EmployeeRepositoryPort employeeRepositoryPort;
    @MockitoBean private DepartmentService departmentService;
    @MockitoBean private JwtTokenProvider jwtTokenProvider;

    @BeforeEach
    void setUp() {
        employeeController = new EmployeeController(createEmployeeUseCase, listEmployeesUseCase, getEmployeeByEmailUseCase, getEmployeeByIdUseCase, getEmployeeContractUseCase, getEmployeeStatsUseCase, mapper, employeeRepositoryPort, departmentService, jwtTokenProvider);
        mockMvc = MockMvcBuilders.standaloneSetup(employeeController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .addPlaceholderValue("version.path", "v1")
                .build();
    }

    @Test
    void should_create_employee_and_return_201() throws Exception {
        //given
        CreateEmployeeRequest request = new CreateEmployeeRequest(
                "Dupont", "Jean", "jean.dupont@test.com", "0102030405",
                LocalDate.of(1990, 1, 1), LocalDate.now(), "Dev",
                1L, "CDI", BigDecimal.valueOf(3000.0), null, "ROLE_USER"
        );

        CreateEmployeeCommand command = new CreateEmployeeCommand(
                 "Dupont", "Jean", "jean.dupont@test.com", "0102030405",
                 LocalDate.of(1990, 1, 1), LocalDate.now(), "Dev",
                 1L, "CDI", BigDecimal.valueOf(3000.0), null, "ROLE_USER"
        );

        EmployeeResult result = new EmployeeResult(
                1L, "EMP001", "Dupont", "Jean", "jean.dupont@test.com", "0102030405",
                 LocalDate.of(1990, 1, 1), LocalDate.now(), "Dev", "ACTIVE", 1L, "CDI", BigDecimal.valueOf(3000.0)
        );

        EmployeeResponse responseDto = new EmployeeResponse(
                1L, "EMP001", "Dupont", "Jean", "jean.dupont@test.com", "0102030405",
                LocalDate.of(1990, 1, 1), LocalDate.now(), "Dev", "ACTIVE",
                1L, "CDI", BigDecimal.valueOf(3000.0)
        );

        given(mapper.toCommand(any(CreateEmployeeRequest.class))).willReturn(command);
        given(createEmployeeUseCase.create(any(CreateEmployeeCommand.class))).willReturn(result);
        given(mapper.toResponse(any(EmployeeResult.class))).willReturn(responseDto);

        //when
        MockHttpServletResponse response = mockMvc.perform(post("/api/v1/employees").contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(request))).andExpect(status().isCreated()).andReturn().getResponse();

        //then
        assertThat(response.getStatus()).isEqualTo(201);
        assertThat(response.getContentAsString()).contains("EMP001");
        assertThat(response.getContentAsString()).contains("Jean");
        assertThat(response.getContentAsString()).contains("Dupont");
    }

    @Test
    void should_get_employee_by_id_and_return_200() throws Exception {
        //given
        Long employeeId = 1L;
        Employee employee = new Employee();
        employee.setId(employeeId);
        employee.setMatricule("EMP001");
        employee.setNom("Dupont");
        employee.setPrenom("Jean");

        EmployeeResponse responseDto = new EmployeeResponse(
                employeeId, "EMP001", "Dupont", "Jean", "jean.dupont@test.com", "0102030405",
                LocalDate.of(1990, 1, 1), LocalDate.now(), "Dev", "ACTIVE",
                1L, "CDI", BigDecimal.valueOf(3000.0)
        );

        given(getEmployeeByIdUseCase.findById(employeeId)).willReturn(Optional.of(employee));
        given(getEmployeeContractUseCase.findContractByEmployeeId(employeeId)).willReturn(Optional.empty());
        given(mapper.toResponseFromList(any())).willReturn(responseDto);

        //when
        MockHttpServletResponse response = mockMvc.perform(get("/api/v1/employees/{id}", employeeId).accept(MediaType.APPLICATION_JSON)).andExpect(status().isOk()) .andReturn().getResponse();

        //then
        assertThat(response.getStatus()).isEqualTo(200);
        assertThat(response.getContentAsString()).contains("EMP001");
        assertThat(response.getContentAsString()).contains("Jean");
    }

    @Test
    void should_return_404_when_employee_not_found() throws Exception {
        //given
        Long employeeId = 99L;
        given(getEmployeeByIdUseCase.findById(employeeId)).willReturn(Optional.empty());

        //when
        MockHttpServletResponse response = mockMvc.perform(get("/api/v1/employees/{id}", employeeId).accept(MediaType.APPLICATION_JSON)).andExpect(status().isNotFound()).andReturn().getResponse();

        //then
        assertThat(response.getStatus()).isEqualTo(404);
    }
}
