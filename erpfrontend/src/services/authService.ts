import type { AuthUser, LoginResponse } from "../types/auth";

export async function login(
  email: string,
  password: string
): Promise<LoginResponse> {
  const response = await fetch("/api/v1/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));

    throw new Error(error.detail ?? "Identifiants incorrects");
  }

  return response.json();
}

export async function fetchAuthenticatedUser(
  token: string
): Promise<AuthUser> {
  const response = await fetch("/api/v1/auth/authenticated-user", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(
      "Impossible de récupérer les informations utilisateur"
    );
  }

  return response.json();
}

export async function validateToken(
  token: string
): Promise<AuthUser | null> {
  try {
    return await fetchAuthenticatedUser(token);
  } catch {
    return null;
  }
}