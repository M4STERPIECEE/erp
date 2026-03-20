from functools import lru_cache
from typing import Annotated
import httpx
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from config import Settings, get_settings

bearer_scheme = HTTPBearer(auto_error=True)

@lru_cache(maxsize=1)
def _fetch_jwks(jwks_uri: str) -> dict:
    """Récupère les clés publiques via le réseau interne Docker."""
    response = httpx.get(jwks_uri, timeout=10)
    response.raise_for_status()
    return response.json()

def decode_token(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(bearer_scheme)],
    settings: Annotated[Settings, Depends(get_settings)],
) -> dict:
    token = credentials.credentials
    try:
        jwks = _fetch_jwks(settings.keycloak_jwks_uri)
        header = jwt.get_unverified_header(token)
        
        key = next(
            (k for k in jwks["keys"] if k.get("kid") == header.get("kid")),
            None,
        )
        if key is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Public key not found in JWKS",
            )

        payload = jwt.decode(
            token,
            key,
            algorithms=[header.get("alg", "RS256")],
            audience=settings.keycloak_client_id,
            issuer=settings.keycloak_issuer,
        )
        return payload
    except JWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {exc}",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc

def get_current_user(payload: Annotated[dict, Depends(decode_token)]) -> dict:
    return {
        "sub": payload.get("sub"),
        "username": payload.get("preferred_username"),
        "email": payload.get("email"),
        "roles": payload.get("realm_access", {}).get("roles", []),
    }

def require_roles(*roles: str):
    def _checker(user: Annotated[dict, Depends(get_current_user)]) -> dict:
        if any(role in user["roles"] for role in roles):
            return user
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Required role(s): {list(roles)}",
        )
    return _checker


RequireAdmin   = Depends(require_roles("admin"))
RequireRh      = Depends(require_roles("rh", "admin"))
RequireEmploye = Depends(require_roles("employe", "rh", "admin"))
