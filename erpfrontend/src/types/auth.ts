// ─── Keycloak token response ────────────────────────────────────────────────
export interface KeycloakTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_expires_in: number;
  refresh_token: string;
  token_type: string;
  session_state: string;
  scope: string;
}

// ─── User returned by FastAPI /auth/me ──────────────────────────────────────
export interface AuthUser {
  sub: string;           // Keycloak user UUID
  username: string;      // preferred_username
  email: string;
  roles: string[];       // realm_access.roles
}

// ─── Role constants ─────────────────────────────────────────────────────────
export const ROLES = {
  ADMIN:   "admin",
  RH:      "rh",
  EMPLOYE: "employe",
} as const;

export type AppRole = (typeof ROLES)[keyof typeof ROLES];

// ─── Auth context shape ──────────────────────────────────────────────────────
export interface AuthContextType {
  user:            AuthUser | null;
  token:           string   | null;
  isAuthenticated: boolean;
  isLoading:       boolean;
  login:           (username: string, password: string) => Promise<void>;
  logout:          () => void;
  hasRole:         (...roles: AppRole[]) => boolean;
}
