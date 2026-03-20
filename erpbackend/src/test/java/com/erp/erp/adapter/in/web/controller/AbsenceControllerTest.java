package com.erp.erp.adapter.in.web.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import com.erp.erp.adapter.in.web.exception.GlobalExceptionHandler;
import com.erp.erp.domain.model.Absence;
import com.erp.erp.domain.model.Employee;
import com.erp.erp.domain.port.in.absence.GetAbsenceUseCase;
import com.erp.erp.domain.port.out.EmployeeRepositoryPort;
import com.erp.erp.infrastructure.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@ExtendWith(SpringExtension.class)
@TestPropertySource(properties = "version.path=v1")
class AbsenceControllerTest {
    private MockMvc mockMvc;
    private AbsenceController absenceController;
    // private final ObjectMapper objectMapper = new ObjectMapper().registerModule(new JavaTimeModule());

    @MockitoBean private GetAbsenceUseCase getAbsenceUseCase;
    @MockitoBean private EmployeeRepositoryPort employeeRepositoryPort;
    @MockitoBean private JwtTokenProvider jwtTokenProvider;
    private Employee mockEmployee;

    @BeforeEach
    void setUp() {
        absenceController = new AbsenceController(getAbsenceUseCase, employeeRepositoryPort, jwtTokenProvider);
        mockMvc = MockMvcBuilders.standaloneSetup(absenceController).setControllerAdvice(new GlobalExceptionHandler()).addPlaceholderValue("version.path", "v1").build();
        mockEmployee = new Employee();
        mockEmployee.setId(1L);
        mockEmployee.setNom("Test");
        mockEmployee.setPrenom("User");
        mockEmployee.setKeycloakId(UUID.randomUUID());
    }

    @Test
    void should_get_my_absences_and_return_200() throws Exception {
        //given
        given(jwtTokenProvider.getCurrentUserId()).willReturn(Optional.of(UUID.randomUUID().toString()));
        given(employeeRepositoryPort.findByKeycloakId(anyString())).willReturn(Optional.of(mockEmployee));
        given(getAbsenceUseCase.listEmployeeAbsences(anyLong(), anyInt(), anyInt())).willReturn(Collections.emptyList());

        //when
        MockHttpServletResponse response = mockMvc.perform(get("/api/v1/absences/my-absences").accept(MediaType.APPLICATION_JSON)).andExpect(status().isOk()).andReturn().getResponse();

        //then
        assertThat(response.getStatus()).isEqualTo(200);
    }

    @Test
    void should_get_my_absences_with_params_and_return_200() throws Exception {
        //given
        given(jwtTokenProvider.getCurrentUserId()).willReturn(Optional.of(UUID.randomUUID().toString()));
        given(employeeRepositoryPort.findByKeycloakId(anyString())).willReturn(Optional.of(mockEmployee));
        given(getAbsenceUseCase.listEmployeeAbsences(mockEmployee.getId(), 5, 2025)).willReturn(List.of(
                new Absence(1L, 1L, LocalDate.of(2025, 5, 10), "Maladie", true)
        ));

        //when
        MockHttpServletResponse response = mockMvc.perform(get("/api/v1/absences/my-absences?mois=5&annee=2025")
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andReturn().getResponse();

        //then
        assertThat(response.getStatus()).isEqualTo(200);
        assertThat(response.getContentAsString()).contains("Maladie");
    }
}
