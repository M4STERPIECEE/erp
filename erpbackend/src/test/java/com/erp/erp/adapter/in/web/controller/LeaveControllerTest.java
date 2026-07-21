package com.erp.erp.adapter.in.web.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import com.erp.erp.adapter.in.web.exception.GlobalExceptionHandler;
import com.erp.erp.domain.model.Employee;
import com.erp.erp.domain.model.Leave;
import com.erp.erp.domain.model.enums.LeaveStatus;
import com.erp.erp.domain.model.enums.LeaveType;
import com.erp.erp.domain.port.in.leave.ApproveLeaveUseCase;
import com.erp.erp.domain.port.in.leave.GetLeaveUseCase;
import com.erp.erp.domain.port.in.leave.RejectLeaveUseCase;
import com.erp.erp.domain.port.in.leave.RequestLeaveUseCase;
import com.erp.erp.domain.port.in.employee.GetEmployeeByEmailUseCase;
import com.erp.erp.infrastructure.security.JwtTokenProvider;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
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
import java.util.Optional;
import java.util.UUID;

@ExtendWith(SpringExtension.class)
@TestPropertySource(properties = "version.path=v1")
class LeaveControllerTest {

    private MockMvc mockMvc;
    private LeaveController leaveController;
    private final ObjectMapper objectMapper = new ObjectMapper().registerModule(new JavaTimeModule());

    @MockitoBean private RequestLeaveUseCase requestLeaveUseCase;
    @MockitoBean private GetLeaveUseCase getLeaveUseCase;
    @MockitoBean private ApproveLeaveUseCase approveLeaveUseCase;
    @MockitoBean private RejectLeaveUseCase rejectLeaveUseCase;
    @MockitoBean private GetEmployeeByEmailUseCase getEmployeeByEmailUseCase;
    @MockitoBean private JwtTokenProvider jwtTokenProvider;

    private Employee mockEmployee;

    @BeforeEach
    void setUp() {
        leaveController = new LeaveController(
                requestLeaveUseCase, getLeaveUseCase, approveLeaveUseCase,
                rejectLeaveUseCase, getEmployeeByEmailUseCase, jwtTokenProvider
        );
        mockMvc = MockMvcBuilders.standaloneSetup(leaveController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .addPlaceholderValue("version.path", "v1")
                .build();

        mockEmployee = new Employee();
        mockEmployee.setId(1L);
        mockEmployee.setNom("Test");
        mockEmployee.setPrenom("User");
    }

    @Test
    void should_get_my_leaves_and_return_200() throws Exception {
        //given
        given(jwtTokenProvider.getCurrentEmail()).willReturn(Optional.of("test@test.com"));
        given(getEmployeeByEmailUseCase.findByEmail(anyString())).willReturn(Optional.of(mockEmployee));
        given(getLeaveUseCase.listEmployeeLeaves(mockEmployee.getId())).willReturn(Collections.emptyList());

        //when
        MockHttpServletResponse response = mockMvc.perform(get("/api/v1/leaves/my-leaves")
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andReturn().getResponse();

        //then
        assertThat(response.getStatus()).isEqualTo(200);
    }

    @Test
    void should_request_leave_and_return_201() throws Exception {
        //given
        LeaveController.RequestLeaveRequest request = new LeaveController.RequestLeaveRequest(
                "ANNUEL", LocalDate.now().plusDays(1), LocalDate.now().plusDays(5), "Vacances"
        );

        Leave leave = new Leave();
        leave.setId(1L);
        leave.setType(LeaveType.ANNUEL);
        leave.setStatut(LeaveStatus.EN_ATTENTE);
        leave.setDateDebut(request.dateDebut());
        leave.setDateFin(request.dateFin());
        leave.setNombreJours(4);

        given(jwtTokenProvider.getCurrentEmail()).willReturn(Optional.of("test@test.com"));
        given(getEmployeeByEmailUseCase.findByEmail(anyString())).willReturn(Optional.of(mockEmployee));
        given(requestLeaveUseCase.requestLeave(anyLong(), anyString(), any(), any(), anyString())).willReturn(leave);

        //when
        MockHttpServletResponse response = mockMvc.perform(post("/api/v1/leaves")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn().getResponse();

        //then
        assertThat(response.getStatus()).isEqualTo(201);
        assertThat(response.getContentAsString()).contains("ANNUEL");
        assertThat(response.getContentAsString()).contains("EN_ATTENTE");
    }

    @Test
    void should_approve_leave_and_return_200() throws Exception {
        //given
        Long leaveId = 1L;
        Leave leave = new Leave();
        leave.setId(leaveId);
        leave.setType(LeaveType.ANNUEL);
        leave.setStatut(LeaveStatus.APPROUVE);
        leave.setDateDebut(LocalDate.now());
        leave.setDateFin(LocalDate.now().plusDays(1));

        given(jwtTokenProvider.getCurrentEmail()).willReturn(Optional.of(UUID.randomUUID().toString()));
        given(getEmployeeByEmailUseCase.findByEmail(anyString())).willReturn(Optional.of(mockEmployee));
        given(approveLeaveUseCase.approveLeave(anyLong(), anyLong())).willReturn(leave);

        //when
        MockHttpServletResponse response = mockMvc.perform(put("/api/v1/leaves/{id}/approve", leaveId)
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andReturn().getResponse();

        //then
        assertThat(response.getStatus()).isEqualTo(200);
        assertThat(response.getContentAsString()).contains("APPROUVE");
    }

    @Test
    void should_get_leave_stats_and_return_200() throws Exception {
        //given
        given(jwtTokenProvider.getCurrentEmail()).willReturn(Optional.of(UUID.randomUUID().toString()));
        given(getEmployeeByEmailUseCase.findByEmail(anyString())).willReturn(Optional.of(mockEmployee));
        given(getLeaveUseCase.countLeaveDaysTakenThisYear(mockEmployee.getId())).willReturn(10);
        given(getLeaveUseCase.countPendingRequests(mockEmployee.getId())).willReturn(2);

        //when
        MockHttpServletResponse response = mockMvc.perform(get("/api/v1/leaves/stats")
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andReturn().getResponse();

        //then
        assertThat(response.getStatus()).isEqualTo(200);
        assertThat(response.getContentAsString()).contains("daysTaken");
        assertThat(response.getContentAsString()).contains("remainingBalance");
    }
}
