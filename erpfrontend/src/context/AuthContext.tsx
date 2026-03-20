import {
  createContext,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { keycloakLogin, validateToken } from "../services/authService";
import type { AppRole, AuthContextType, AuthUser } from "../types/auth";

const AuthContext = createContext<AuthContextType | null>(null);

const TOKEN_KEY = "erp_access_token";

export { AuthContext };

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,      setUser]      = useState<AuthUser | null>(null);
  const [token,     setToken]     = useState<string   | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(TOKEN_KEY);
    if (!stored) {
      setIsLoading(false);
      return;
    }

    validateToken(stored).then((me) => {
      if (me) {
        setToken(stored);
        setUser(me);
      } else {
        localStorage.removeItem(TOKEN_KEY);
      }
      setIsLoading(false);
    });
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const tokenResp   = await keycloakLogin(username, password);
    const accessToken = tokenResp.access_token;

    const me = await import("../services/authService").then((m) =>
      m.fetchMe(accessToken)
    );

    localStorage.setItem(TOKEN_KEY, accessToken);
    setToken(accessToken);
    setUser(me);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const hasRole = useCallback(
    (...roles: AppRole[]) =>
      !!user && roles.some((r) => user.roles.includes(r)),
    [user]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
