import axios from "axios";
import type {
  KeycloakUser,
  KeycloakUsersPage,
  CreateKeycloakUserRequest,
  UpdateKeycloakUserRequest,
  AssignRolesRequest,
} from "../types/keycloak.types";

const api = axios.create({ baseURL: "/api/v1/keycloak" });
const TOKEN_KEY = "erp_access_token";

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function getKeycloakUsers(params: { page?: number; size?: number; search?: string } = {}): Promise<KeycloakUsersPage> {
  const { data } = await api.get<KeycloakUsersPage>("/users", { params });
  return data;
}

export async function createKeycloakUser(payload: CreateKeycloakUserRequest): Promise<KeycloakUser> {
  const { data } = await api.post<KeycloakUser>("/users", payload);
  return data;
}

export async function updateKeycloakUser(userId: string, payload: UpdateKeycloakUserRequest): Promise<KeycloakUser> {
  const { data } = await api.put<KeycloakUser>(`/users/${userId}`, payload);
  return data;
}

export async function deleteKeycloakUser(userId: string): Promise<void> {
  await api.delete(`/users/${userId}`);
}

export async function assignRoles(userId: string, payload: AssignRolesRequest): Promise<void> {
  await api.put(`/users/${userId}/roles`, payload);
}

export async function toggleUserStatus(userId: string): Promise<{ enabled: boolean }> {
  const { data } = await api.put<{ enabled: boolean }>(`/users/${userId}/toggle-status`);
  return data;
}

export async function resetPassword(userId: string): Promise<void> {
  await api.post(`/users/${userId}/reset-password`);
}
