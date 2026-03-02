import axios from "axios";
import type {
  DepartementResponse,
  CreateDepartementRequest,
} from "../types/departement.types";

const api = axios.create({ baseURL: "/api" });
const TOKEN_KEY = "erp_access_token";

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function getDepartements(): Promise<DepartementResponse[]> {
  const { data } = await api.get<DepartementResponse[]>("/departements");
  return data;
}

export async function getDepartement(id: number): Promise<DepartementResponse> {
  const { data } = await api.get<DepartementResponse>(`/departements/${id}`);
  return data;
}

export async function createDepartement(payload: CreateDepartementRequest): Promise<DepartementResponse> {
  const { data } = await api.post<DepartementResponse>("/departements", payload);
  return data;
}

export async function updateDepartement(id: number, payload: CreateDepartementRequest): Promise<DepartementResponse> {
  const { data } = await api.put<DepartementResponse>(`/departements/${id}`, payload);
  return data;
}

export async function deleteDepartement(id: number): Promise<void> {
  await api.delete(`/departements/${id}`);
}
