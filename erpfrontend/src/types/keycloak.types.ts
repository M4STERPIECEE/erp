// ── Keycloak Admin types ─────────────────────────────────────────────────────

export interface KeycloakUser {
  id: string;
  username: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  enabled: boolean;
  createdTimestamp: number | null;
  roles: string[];
}

export interface CreateKeycloakUserRequest {
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  password: string;
  enabled?: boolean;
  roles?: string[];
}

export interface UpdateKeycloakUserRequest {
  email?: string;
  firstName?: string;
  lastName?: string;
  enabled?: boolean;
}

export interface AssignRolesRequest {
  roles: string[];
}

export interface KeycloakUsersPage {
  content: KeycloakUser[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

export const KC_MANAGED_ROLES = ["admin", "rh", "employe"] as const;
export type KcRole = (typeof KC_MANAGED_ROLES)[number];
