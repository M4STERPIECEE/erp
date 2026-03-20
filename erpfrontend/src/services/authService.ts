import type { AuthUser, KeycloakTokenResponse } from "../types/auth";

const KEYCLOAK_TOKEN_URL    = "/keycloak/realms/erp/protocol/openid-connect/token";
const FASTAPI_BASE_URL      = "/fastapi";
const KEYCLOAK_CLIENT_ID    = import.meta.env.VITE_KEYCLOAK_CLIENT_ID    as string;
const KEYCLOAK_CLIENT_SECRET = import.meta.env.VITE_KEYCLOAK_CLIENT_SECRET as string | undefined;


export async function keycloakLogin(
  username: string,
  password: string
): Promise<KeycloakTokenResponse> {
  const params: Record<string, string> = {
    grant_type: "password",
    client_id:  KEYCLOAK_CLIENT_ID,
    username,
    password,
  };
  if (KEYCLOAK_CLIENT_SECRET) params.client_secret = KEYCLOAK_CLIENT_SECRET;

  const body = new URLSearchParams(params);

  const response = await fetch(KEYCLOAK_TOKEN_URL, {
    method:  "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body:    body.toString(),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(
      (err as { error_description?: string }).error_description ??
        "Identifiants incorrects"
    );
  }

  return response.json() as Promise<KeycloakTokenResponse>;
}

export async function fetchMe(token: string): Promise<AuthUser> {
  const response = await fetch(`${FASTAPI_BASE_URL}/api/v1/auth/me`, {
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
