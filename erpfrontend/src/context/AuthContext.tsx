import {
  createContext,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  login as apiLogin,
  fetchAuthenticatedUser,
  validateToken,
} from "../services/authService";

import type {
  AppRole,
  AuthContextType,
  AuthUser,
} from "../types/auth";

const AuthContext = createContext<AuthContextType | null>(null);

const TOKEN_KEY = "erp_access_token";

export { AuthContext };

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [isLoading, setIsLoading] = useState(() => !!localStorage.getItem(TOKEN_KEY));

  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    if (!storedToken) return;

    validateToken(storedToken)
      .then((authenticatedUser) => {
        if (authenticatedUser) {
          setToken(storedToken);
          setUser(authenticatedUser);
        } else {
          localStorage.removeItem(TOKEN_KEY);
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const response = await apiLogin(email, password);

      const accessToken = response.token;

      const authenticatedUser =
        await fetchAuthenticatedUser(accessToken);

      localStorage.setItem(TOKEN_KEY, accessToken);

      setToken(accessToken);
      setUser(authenticatedUser);
    },
    []
  );

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);

    setToken(null);
    setUser(null);
  }, []);

  const hasRole = useCallback(
    (...roles: AppRole[]) =>
      Boolean(
        user &&
        roles.some((role) => user.roles.includes(role))
      ),
    [user]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(user),
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
