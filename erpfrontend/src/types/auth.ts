export interface LoginResponse {
  token: string;
}

export interface AuthUser {
  sub: string;
  username: string;
  email: string;
  roles: string[];
}

export const ROLES = {
  ADMIN: "admin",
  RH: "rh",
  EMPLOYE: "employe",
} as const;

export type AppRole = (typeof ROLES)[keyof typeof ROLES];
export interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  hasRole: (...roles: AppRole[]) => boolean;
}
