import axios from "axios";
import type {
  CreateEmployeeRequest,
  EmployeeResponse,
  GetEmployeesParams,
  PagedEmployeeResponse,
} from "../types/employee.types";

// ─── Axios instance with JWT interceptor ────────────────────────────────────

const api = axios.create({ baseURL: "/api" });

const TOKEN_KEY = "erp_access_token";

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Employe endpoints ──────────────────────────────────────────────────────

export async function getEmployees(params: GetEmployeesParams = {}): Promise<PagedEmployeeResponse> {
  const { data } = await api.get<PagedEmployeeResponse>("/employees", { params });
  return data;
}

export async function createEmployee(payload: CreateEmployeeRequest): Promise<EmployeeResponse> {
  const { data } = await api.post<EmployeeResponse>("/employees", payload);
  return data;
}

export async function deleteEmployee(id: number): Promise<void> {
  await api.delete(`/employees/${id}`);
}

export default api;
