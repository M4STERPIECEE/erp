import type { AuthUser, LoginResponse } from "../types/auth";

export async function login(
  email: string,
  password: string
): Promise<LoginResponse> {
  const response = await fetch("/api/v1/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail ?? "Identifiants incorrects");
  }

  return response.json() as Promise<LoginResponse>;
}

export async function fetchMe(token: string): Promise<AuthUser> {
  const response = await fetch(`/api/v1/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error("Impossible de récupérer les informations utilisateur");
  }

  return response.json() as Promise<AuthUser>;
}

export async function validateToken(token: string): Promise<AuthUser | null> {
  try {
    return await fetchMe(token);
  } catch {
    return null;
  }
}
