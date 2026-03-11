import axios from "axios";
import type {
  CreateEmployeeRequest,
  EmployeeResponse,
  GetEmployeesParams,
  PagedEmployeeResponse,
  UpdateEmployeeRequest,
} from "../types/employee.types";


const api = axios.create({ baseURL: "/api" });

const TOKEN_KEY = "erp_access_token";

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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

export async function getEmployeeById(id: number): Promise<EmployeeResponse> {
  const { data } = await api.get<EmployeeResponse>(`/employees/${id}`);
  return data;
}

export async function updateEmployee(id: number, payload: UpdateEmployeeRequest): Promise<EmployeeResponse> {
  const { data } = await api.put<EmployeeResponse>(`/employees/${id}`, payload);
  return data;
}

export interface EmployeeStats {
  totalEmployees: number;
  contractDistribution: Record<string, number>;
}

export async function getEmployeeStats(): Promise<EmployeeStats> {
  const { data } = await api.get<EmployeeStats>("/employees/stats");
  return data;
}

export default api;
