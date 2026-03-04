"""
Keycloak Admin REST API – proxy endpoints.
Uses the service-account of the erp-fastapi client to manage users & roles.
"""

from typing import Annotated

import httpx
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel

from auth.keycloak import RequireAdmin
from config import Settings, get_settings

router = APIRouter(prefix="/keycloak", tags=["Keycloak Admin"])
_admin_token_cache: dict = {"token": None, "expires_at": 0}


async def _get_admin_token(settings: Settings) -> str:
    """Obtain a service-account access token via client_credentials grant."""
    import time

    now = time.time()
    if _admin_token_cache["token"] and now < _admin_token_cache["expires_at"] - 30:
        return _admin_token_cache["token"]

    url = f"{settings.keycloak_internal_url}/realms/{settings.keycloak_realm}/protocol/openid-connect/token"
    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.post(url, data={
            "grant_type": "client_credentials",
            "client_id": settings.keycloak_client_id,
            "client_secret": settings.keycloak_client_secret,
        })
    if resp.status_code != 200:
        raise HTTPException(status_code=502, detail=f"Cannot get Keycloak admin token: {resp.text}")

    data = resp.json()
    _admin_token_cache["token"] = data["access_token"]
    _admin_token_cache["expires_at"] = now + data.get("expires_in", 300)
    return data["access_token"]


def _admin_url(settings: Settings) -> str:
    return f"{settings.keycloak_internal_url}/admin/realms/{settings.keycloak_realm}"

class KeycloakUserOut(BaseModel):
    id: str
    username: str
    email: str | None = None
    firstName: str | None = None
    lastName: str | None = None
    enabled: bool = True
    createdTimestamp: int | None = None
    roles: list[str] = []


class CreateKeycloakUserIn(BaseModel):
    username: str
    email: str
    firstName: str = ""
    lastName: str = ""
    password: str
    enabled: bool = True
    roles: list[str] = []


class UpdateKeycloakUserIn(BaseModel):
    email: str | None = None
    firstName: str | None = None
    lastName: str | None = None
    enabled: bool | None = None


class AssignRolesIn(BaseModel):
    roles: list[str] 


class SyncStatusOut(BaseModel):
    keycloakId: str
    username: str
    email: str | None = None
    enabled: bool = True
    roles: list[str] = []
    linkedEmployeeId: int | None = None
    linkedEmployeeName: str | None = None

MANAGED_ROLES = {"admin", "rh", "employe"}


async def _get_realm_roles(token: str, settings: Settings) -> dict[str, dict]:
    """Return a dict of roleName -> roleRepresentation for managed roles."""
    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.get(
            f"{_admin_url(settings)}/roles",
            headers={"Authorization": f"Bearer {token}"},
        )
    if resp.status_code != 200:
        return {}
    return {r["name"]: r for r in resp.json() if r["name"] in MANAGED_ROLES}


async def _get_user_realm_roles(token: str, user_id: str, settings: Settings) -> list[str]:
    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.get(
            f"{_admin_url(settings)}/users/{user_id}/role-mappings/realm",
            headers={"Authorization": f"Bearer {token}"},
        )
    if resp.status_code != 200:
        return []
    return [r["name"] for r in resp.json() if r["name"] in MANAGED_ROLES]


class PaginatedKeycloakUsers(BaseModel):
    content: list[KeycloakUserOut] = []
    totalElements: int = 0
    totalPages: int = 0
    page: int = 0
    size: int = 10


@router.get("/users", response_model=PaginatedKeycloakUsers)
async def list_users(
    _user: Annotated[dict, RequireAdmin],
    settings: Annotated[Settings, Depends(get_settings)],
    page: int = Query(0, ge=0),
    size: int = Query(10, ge=1, le=100),
    search: str = Query("", max_length=200),
):
    token = await _get_admin_token(settings)

    # Keycloak count endpoint (excludes service accounts via search if needed)
    count_params: dict = {}
    list_params: dict = {"max": 500}
    if search:
        count_params["search"] = search
        list_params["search"] = search

    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.get(
            f"{_admin_url(settings)}/users",
            params=list_params,
            headers={"Authorization": f"Bearer {token}"},
        )
    if resp.status_code != 200:
        raise HTTPException(status_code=resp.status_code, detail=resp.text)

    all_users = [u for u in resp.json() if not u.get("username", "").startswith("service-account-")]

    total = len(all_users)
    total_pages = max(1, (total + size - 1) // size)
    start = page * size
    page_users = all_users[start : start + size]

    result: list[KeycloakUserOut] = []
    for u in page_users:
        roles = await _get_user_realm_roles(token, u["id"], settings)
        result.append(KeycloakUserOut(
            id=u["id"],
            username=u.get("username", ""),
            email=u.get("email"),
            firstName=u.get("firstName"),
            lastName=u.get("lastName"),
            enabled=u.get("enabled", True),
            createdTimestamp=u.get("createdTimestamp"),
            roles=roles,
        ))

    return PaginatedKeycloakUsers(
        content=result,
        totalElements=total,
        totalPages=total_pages,
        page=page,
        size=size,
    )


@router.post("/users", response_model=KeycloakUserOut, status_code=201)
async def create_user(
    body: CreateKeycloakUserIn,
    _user: Annotated[dict, RequireAdmin],
    settings: Annotated[Settings, Depends(get_settings)],
):
    token = await _get_admin_token(settings)
    payload = {
        "username": body.username,
        "email": body.email,
        "firstName": body.firstName,
        "lastName": body.lastName,
        "enabled": body.enabled,
        "credentials": [{"type": "password", "value": body.password, "temporary": False}],
    }

    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.post(
            f"{_admin_url(settings)}/users",
            json=payload,
            headers={"Authorization": f"Bearer {token}"},
        )
    if resp.status_code == 409:
        raise HTTPException(status_code=409, detail="Un utilisateur avec ce nom ou email existe déjà.")
    if resp.status_code not in (201, 204):
        raise HTTPException(status_code=resp.status_code, detail=resp.text)
    location = resp.headers.get("Location", "")
    user_id = location.rsplit("/", 1)[-1]

    if body.roles:
        all_roles = await _get_realm_roles(token, settings)
        roles_to_assign = [all_roles[r] for r in body.roles if r in all_roles]
        if roles_to_assign:
            async with httpx.AsyncClient(timeout=10) as client:
                await client.post(
                    f"{_admin_url(settings)}/users/{user_id}/role-mappings/realm",
                    json=roles_to_assign,
                    headers={"Authorization": f"Bearer {token}"},
                )

    roles = await _get_user_realm_roles(token, user_id, settings)
    return KeycloakUserOut(
        id=user_id,
        username=body.username,
        email=body.email,
        firstName=body.firstName,
        lastName=body.lastName,
        enabled=body.enabled,
        roles=roles,
    )


@router.put("/users/{user_id}", response_model=KeycloakUserOut)
async def update_user(
    user_id: str,
    body: UpdateKeycloakUserIn,
    _user: Annotated[dict, RequireAdmin],
    settings: Annotated[Settings, Depends(get_settings)],
):
    token = await _get_admin_token(settings)
    update_payload: dict = {}
    if body.email is not None:
        update_payload["email"] = body.email
    if body.firstName is not None:
        update_payload["firstName"] = body.firstName
    if body.lastName is not None:
        update_payload["lastName"] = body.lastName
    if body.enabled is not None:
        update_payload["enabled"] = body.enabled

    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.put(
            f"{_admin_url(settings)}/users/{user_id}",
            json=update_payload,
            headers={"Authorization": f"Bearer {token}"},
        )
    if resp.status_code == 404:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable")
    if resp.status_code not in (200, 204):
        raise HTTPException(status_code=resp.status_code, detail=resp.text)
    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.get(
            f"{_admin_url(settings)}/users/{user_id}",
            headers={"Authorization": f"Bearer {token}"},
        )
    u = resp.json()
    roles = await _get_user_realm_roles(token, user_id, settings)
    return KeycloakUserOut(
        id=u["id"],
        username=u.get("username", ""),
        email=u.get("email"),
        firstName=u.get("firstName"),
        lastName=u.get("lastName"),
        enabled=u.get("enabled", True),
        createdTimestamp=u.get("createdTimestamp"),
        roles=roles,
    )


@router.delete("/users/{user_id}", status_code=204)
async def delete_user(
    user_id: str,
    _user: Annotated[dict, RequireAdmin],
    settings: Annotated[Settings, Depends(get_settings)],
):
    token = await _get_admin_token(settings)
    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.delete(
            f"{_admin_url(settings)}/users/{user_id}",
            headers={"Authorization": f"Bearer {token}"},
        )
    if resp.status_code == 404:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable")
    if resp.status_code not in (200, 204):
        raise HTTPException(status_code=resp.status_code, detail=resp.text)


@router.put("/users/{user_id}/roles")
async def assign_roles(
    user_id: str,
    body: AssignRolesIn,
    _user: Annotated[dict, RequireAdmin],
    settings: Annotated[Settings, Depends(get_settings)],
):
    token = await _get_admin_token(settings)
    all_roles = await _get_realm_roles(token, settings)
    current = await _get_user_realm_roles(token, user_id, settings)
    roles_to_remove = [all_roles[r] for r in current if r in all_roles]
    if roles_to_remove:
        async with httpx.AsyncClient(timeout=10) as client:
            await client.request(
                "DELETE",
                f"{_admin_url(settings)}/users/{user_id}/role-mappings/realm",
                json=roles_to_remove,
                headers={"Authorization": f"Bearer {token}"},
            )
    roles_to_add = [all_roles[r] for r in body.roles if r in all_roles]
    if roles_to_add:
        async with httpx.AsyncClient(timeout=10) as client:
            await client.post(
                f"{_admin_url(settings)}/users/{user_id}/role-mappings/realm",
                json=roles_to_add,
                headers={"Authorization": f"Bearer {token}"},
            )

    return {"roles": body.roles}


@router.put("/users/{user_id}/toggle-status")
async def toggle_user_status(
    user_id: str,
    _user: Annotated[dict, RequireAdmin],
    settings: Annotated[Settings, Depends(get_settings)],
):
    """Toggle enabled/disabled on a user."""
    token = await _get_admin_token(settings)
    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.get(
            f"{_admin_url(settings)}/users/{user_id}",
            headers={"Authorization": f"Bearer {token}"},
        )
    if resp.status_code == 404:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable")
    user_data = resp.json()
    new_enabled = not user_data.get("enabled", True)

    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.put(
            f"{_admin_url(settings)}/users/{user_id}",
            json={"enabled": new_enabled},
            headers={"Authorization": f"Bearer {token}"},
        )
    return {"enabled": new_enabled}


@router.post("/users/{user_id}/reset-password", status_code=204)
async def reset_password(
    user_id: str,
    _user: Annotated[dict, RequireAdmin],
    settings: Annotated[Settings, Depends(get_settings)],
):
    """Reset password to a default one."""
    token = await _get_admin_token(settings)

    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.put(
            f"{_admin_url(settings)}/users/{user_id}/reset-password",
            json={"type": "password", "value": "Changeme1!", "temporary": False},
            headers={"Authorization": f"Bearer {token}"},
        )
    if resp.status_code not in (200, 204):
        raise HTTPException(status_code=resp.status_code, detail=resp.text)
    async with httpx.AsyncClient(timeout=10) as client:
        await client.put(
            f"{_admin_url(settings)}/users/{user_id}",
            json={"requiredActions": []},
            headers={"Authorization": f"Bearer {token}"},
        )
