from typing import Annotated

from fastapi import APIRouter, Depends

from auth.keycloak import RequireAdmin, RequireEmploye, RequireRh, get_current_user

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.get("/me", summary="Infos utilisateur connecté (tout authentifié)")
def me(
    user: Annotated[dict, Depends(get_current_user)],
) -> dict:
    return user


@router.get("/admin/me", summary="Réservé au rôle admin")
def me_admin(
    user: Annotated[dict, RequireAdmin],
) -> dict:
    return user


@router.get("/rh/me", summary="Réservé aux rôles rh et admin")
def me_rh(
    user: Annotated[dict, RequireRh],
) -> dict:
    return user


@router.get("/employe/me", summary="Réservé aux rôles employe, rh et admin")
def me_employe(
    user: Annotated[dict, RequireEmploye],
) -> dict:
    return user
