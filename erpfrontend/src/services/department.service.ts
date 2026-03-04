import axios from "axios";
import type {
  DepartmentResponse,
  CreateDepartmentRequest,
} from "../types/department.types";

const api = axios.create({ baseURL: "/api" });
const TOKEN_KEY = "erp_access_token";

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function getDepartments(): Promise<DepartmentResponse[]> {
  const { data } = await api.get<DepartmentResponse[]>("/departements");
  return data;
}

export async function getDepartment(id: number): Promise<DepartmentResponse> {
  const { data } = await api.get<DepartmentResponse>(`/departements/${id}`);
  return data;
}

export async function createDepartment(payload: CreateDepartmentRequest): Promise<DepartmentResponse> {
  const { data } = await api.post<DepartmentResponse>("/departements", payload);
  return data;
}

export async function updateDepartment(id: number, payload: CreateDepartmentRequest): Promise<DepartmentResponse> {
  const { data } = await api.put<DepartmentResponse>(`/departements/${id}`, payload);
  return data;
}

export async function deleteDepartment(id: number): Promise<void> {
  await api.delete(`/departements/${id}`);
}
