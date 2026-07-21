package com.erp.erp.adapter.in.web.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import com.erp.erp.adapter.in.web.dto.request.CreateDepartementRequest;
import com.erp.erp.adapter.in.web.exception.GlobalExceptionHandler;
import com.erp.erp.domain.model.Department;
import com.erp.erp.domain.port.in.department.CreateDepartmentUseCase;
import com.erp.erp.domain.port.in.department.GetDepartmentUseCase;
import com.erp.erp.domain.port.in.department.UpdateDepartmentUseCase;
import com.fasterxml.jackson.databind.ObjectMapper;
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
import java.util.List;
import java.util.Optional;

@ExtendWith(SpringExtension.class)
@TestPropertySource(properties = "version.path=v1")
class DepartmentControllerTest {

    private MockMvc mockMvc;
    private DepartmentController departmentController;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @MockitoBean private GetDepartmentUseCase getDepartmentUseCase;
    @MockitoBean private CreateDepartmentUseCase createDepartmentUseCase;
    @MockitoBean private UpdateDepartmentUseCase updateDepartmentUseCase;

    @BeforeEach
    void setUp() {
        departmentController = new DepartmentController(getDepartmentUseCase, createDepartmentUseCase, updateDepartmentUseCase);
        mockMvc = MockMvcBuilders.standaloneSetup(departmentController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .addPlaceholderValue("version.path", "v1")
                .build();
    }

    @Test
    void should_list_departments_and_return_200() throws Exception {
        //given
        Department dept = new Department();
        dept.setId(1L);
        dept.setNom("IT");
        dept.setDescription("Information Technology");
        dept.setNombreEmployes(10);

        given(getDepartmentUseCase.listAll()).willReturn(List.of(dept));

        //when
        MockHttpServletResponse response = mockMvc.perform(get("/api/v1/departments")
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andReturn().getResponse();

        //then
        assertThat(response.getStatus()).isEqualTo(200);
        assertThat(response.getContentAsString()).contains("IT");
    }

    @Test
    void should_get_department_by_id_and_return_200() throws Exception {
        //given
        Long id = 1L;
        Department dept = new Department();
        dept.setId(id);
        dept.setNom("HR");

        given(getDepartmentUseCase.findById(id)).willReturn(Optional.of(dept));

        //when
        MockHttpServletResponse response = mockMvc.perform(get("/api/v1/departments/{id}", id)
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andReturn().getResponse();

        //then
        assertThat(response.getStatus()).isEqualTo(200);
        assertThat(response.getContentAsString()).contains("HR");
    }

    @Test
    void should_create_department_and_return_201() throws Exception {
        //given
        CreateDepartementRequest request = new CreateDepartementRequest("Marketing", "Mktdesc", 100L);
        
        Department saved = new Department();
        saved.setId(1L);
        saved.setNom("Marketing");

        given(createDepartmentUseCase.create(any(Department.class))).willReturn(saved);

        //when
        MockHttpServletResponse response = mockMvc.perform(post("/api/v1/departments")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn().getResponse();

        //then
        assertThat(response.getStatus()).isEqualTo(201);
        assertThat(response.getContentAsString()).contains("Marketing");
    }

    @Test
    void should_return_404_when_department_not_found() throws Exception {
        //given
        Long id = 99L;
        given(getDepartmentUseCase.findById(id)).willReturn(Optional.empty());

        //when
        MockHttpServletResponse response = mockMvc.perform(get("/api/v1/departments/{id}", id)
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound())
                .andReturn().getResponse();

        //then
        assertThat(response.getStatus()).isEqualTo(404);
    }
}
